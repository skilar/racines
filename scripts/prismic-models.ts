import { createInterface } from 'node:readline/promises'
import { parseArgs } from 'node:util'
import {
    BulkUpdateHasExistingDocumentsError,
    BulkUpdateOperationType,
    ForbiddenError,
    InvalidPayloadError,
    UnauthorizedError,
} from '@prismicio/custom-types-client'
import type { CustomTypesClient } from '@prismicio/custom-types-client'
import { createModelsClient } from './prismic/client.ts'
import {
    readLocalModels,
    removeCustomType,
    removeSlice,
    writeCustomType,
    writeSlice,
} from './prismic/local-models.ts'
import type { LocalModels } from './prismic/local-models.ts'
import { diffModels, formatOperations, isDeletion } from './prismic/plan.ts'

const USAGE = `Sync Prismic content models between this repository and Prismic.

Usage
  npm run prismic:status
  npm run prismic:pull
  npm run prismic:push -- [--force] [--yes]

Commands
  status   Show how local models differ from Prismic. Makes no changes.
  pull     Write Prismic's models to customtypes/ and slices/.
  push     Send local models to Prismic.

Options
  --force  Allow push to delete models that exist in Prismic but not locally.
  --yes    Skip the confirmation prompt.`

const fetchRemoteModels = async (
    client: CustomTypesClient,
): Promise<LocalModels> => ({
    customTypes: await client.getAllCustomTypes(),
    slices: await client.getAllSharedSlices(),
})

const confirm = async (question: string): Promise<boolean> => {
    if (!process.stdin.isTTY) {
        console.error('Not a terminal — re-run with --yes to confirm.')

        return false
    }

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    try {
        const answer = await rl.question(`${question} [y/N] `)

        return /^y(es)?$/i.test(answer.trim())
    } finally {
        rl.close()
    }
}

const pull = async (): Promise<void> => {
    const client = createModelsClient()
    const remote = await fetchRemoteModels(client)
    const local = await readLocalModels()
    const operations = diffModels(local, remote)

    if (operations.length === 0) {
        console.info('Local models are already up to date.')

        return
    }

    for (const operation of operations) {
        switch (operation.type) {
            case BulkUpdateOperationType.CustomTypeInsert:
            case BulkUpdateOperationType.CustomTypeUpdate:
                await writeCustomType(operation.payload)
                break
            case BulkUpdateOperationType.CustomTypeDelete:
                await removeCustomType(operation.id)
                break
            case BulkUpdateOperationType.SliceInsert:
            case BulkUpdateOperationType.SliceUpdate:
                await writeSlice(operation.payload)
                break
            case BulkUpdateOperationType.SliceDelete:
                await removeSlice(operation.id)
                break
        }
    }

    console.info(formatOperations(operations))
    console.info(
        `\nPulled ${operations.length} change(s). Run "npm run typegen" to refresh types.`,
    )
}

const status = async (): Promise<void> => {
    const client = createModelsClient()
    const remote = await fetchRemoteModels(client)
    const local = await readLocalModels()
    const toPush = diffModels(remote, local)
    const toPull = diffModels(local, remote)

    if (toPush.length === 0 && toPull.length === 0) {
        console.info('Local models and Prismic are in sync.')

        return
    }

    console.info('push would send to Prismic:')
    console.info(toPush.length > 0 ? formatOperations(toPush) : '  nothing')
    console.info('\npull would write locally:')
    console.info(toPull.length > 0 ? formatOperations(toPull) : '  nothing')
}

const reportPushError = (error: unknown): void => {
    if (error instanceof BulkUpdateHasExistingDocumentsError) {
        console.error(
            '\nPrismic rejected the push: a model you are deleting still has documents.\n' +
                'Delete or migrate those documents in Prismic first, then push again.\n' +
                'Nothing was changed — the transaction is atomic.',
        )
    } else if (error instanceof ForbiddenError) {
        console.error(
            '\nPrismic rejected the push: the token is not allowed to write.\n' +
                'Create a write token with "npx prismic token create --write" and update\n' +
                'PRISMIC_CUSTOM_TYPES_API_TOKEN in .env.',
        )
    } else if (error instanceof UnauthorizedError) {
        console.error(
            '\nPrismic rejected the token. Check PRISMIC_CUSTOM_TYPES_API_TOKEN in .env.',
        )
    } else if (error instanceof InvalidPayloadError) {
        console.error(
            `\nPrismic rejected a model as invalid:\n${error.message}`,
        )
    } else {
        throw error
    }

    process.exitCode = 1
}

const push = async (force: boolean, skipPrompt: boolean): Promise<void> => {
    const client = createModelsClient()
    const remote = await fetchRemoteModels(client)
    const local = await readLocalModels()
    const operations = diffModels(remote, local)

    if (operations.length === 0) {
        console.info('Prismic is already up to date.')

        return
    }

    const deletions = operations.filter(isDeletion)

    if (deletions.length > 0 && !force) {
        console.error(
            'Refusing to push. These exist in Prismic but not locally:',
        )
        console.error(formatOperations(deletions))
        console.error(
            '\nRe-run with --force to delete them, or run "npm run prismic:pull"\n' +
                'to restore them locally.',
        )
        process.exitCode = 1

        return
    }

    console.info('The following changes will be sent to Prismic:')
    console.info(formatOperations(operations))

    if (deletions.length > 0) {
        console.info(
            '\nDeletions are permanent and fail if the model still has documents.',
        )
    }

    if (!skipPrompt && !(await confirm('\nApply these changes?'))) {
        console.info('Aborted. Nothing was changed.')
        process.exitCode = 1

        return
    }

    try {
        await client.bulkUpdate(operations)
    } catch (error) {
        reportPushError(error)

        return
    }

    console.info(`\nPushed ${operations.length} change(s).`)
}

const main = async (): Promise<void> => {
    const { positionals, values } = parseArgs({
        allowPositionals: true,
        options: {
            force: { type: 'boolean', default: false },
            yes: { type: 'boolean', short: 'y', default: false },
        },
    })

    switch (positionals[0]) {
        case 'pull':
            await pull()
            break
        case 'status':
            await status()
            break
        case 'push':
            await push(values.force, values.yes)
            break
        default:
            console.info(USAGE)
            process.exitCode = 1
    }
}

try {
    await main()
} catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
}
