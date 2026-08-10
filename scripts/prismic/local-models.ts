import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import type { CustomTypeModel, SharedSliceModel } from '@prismicio/client'

/** Directory holding one folder per custom type, each with an index.json. */
export const CUSTOM_TYPES_DIR = 'customtypes'

/** Directory holding one folder per shared slice, each with a model.json. */
export const SLICES_DIR = 'slices'

const CUSTOM_TYPE_FILE = 'index.json'
const SLICE_FILE = 'model.json'

export interface LocalModels {
    customTypes: CustomTypeModel[]
    slices: SharedSliceModel[]
}

export const customTypePath = (id: string): string =>
    path.join(CUSTOM_TYPES_DIR, id, CUSTOM_TYPE_FILE)

export const slicePath = (id: string): string =>
    path.join(SLICES_DIR, id, SLICE_FILE)

/**
 * Serializes a model. Key order is preserved because it determines field and
 * tab order in the Prismic editor — never sort keys.
 */
const serialize = (model: unknown): string =>
    `${JSON.stringify(model, null, 2)}\n`

const byId = <T extends { id: string }>(models: T[]): T[] =>
    [...models].sort((a, b) => a.id.localeCompare(b.id))

const readModelDir = async <T extends { id: string }>(
    dir: string,
    filename: string,
): Promise<T[]> => {
    let entries

    try {
        entries = await readdir(dir, { withFileTypes: true })
    } catch {
        return []
    }

    const models: T[] = []

    for (const entry of entries) {
        if (!entry.isDirectory()) continue

        const file = path.join(dir, entry.name, filename)
        let raw: string

        try {
            raw = await readFile(file, 'utf8')
        } catch {
            // A directory without a model file is not a model.
            continue
        }

        try {
            models.push(JSON.parse(raw) as T)
        } catch (error) {
            const reason = error instanceof Error ? error.message : error
            throw new Error(`Could not parse ${file}: ${reason}`)
        }
    }

    return byId(models)
}

/** Reads every model committed to the repository. */
export const readLocalModels = async (): Promise<LocalModels> => ({
    customTypes: await readModelDir<CustomTypeModel>(
        CUSTOM_TYPES_DIR,
        CUSTOM_TYPE_FILE,
    ),
    slices: await readModelDir<SharedSliceModel>(SLICES_DIR, SLICE_FILE),
})

const writeModel = async (file: string, model: unknown): Promise<void> => {
    await mkdir(path.dirname(file), { recursive: true })
    await writeFile(file, serialize(model), 'utf8')
}

export const writeCustomType = async (model: CustomTypeModel): Promise<void> =>
    writeModel(customTypePath(model.id), model)

export const writeSlice = async (model: SharedSliceModel): Promise<void> =>
    writeModel(slicePath(model.id), model)

export const removeCustomType = async (id: string): Promise<void> => {
    await rm(path.join(CUSTOM_TYPES_DIR, id), { recursive: true, force: true })
}

export const removeSlice = async (id: string): Promise<void> => {
    await rm(path.join(SLICES_DIR, id), { recursive: true, force: true })
}
