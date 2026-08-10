import {
    BulkUpdateOperationType,
    createBulkUpdateTransaction,
} from '@prismicio/custom-types-client'
import type { BulkUpdateOperation } from '@prismicio/custom-types-client'
import type { LocalModels } from './local-models.ts'

const LABELS: Record<BulkUpdateOperation['type'], string> = {
    [BulkUpdateOperationType.CustomTypeInsert]: '+ type ',
    [BulkUpdateOperationType.CustomTypeUpdate]: '~ type ',
    [BulkUpdateOperationType.CustomTypeDelete]: '- type ',
    [BulkUpdateOperationType.SliceInsert]: '+ slice',
    [BulkUpdateOperationType.SliceUpdate]: '~ slice',
    [BulkUpdateOperationType.SliceDelete]: '- slice',
}

const ORDER: Record<BulkUpdateOperation['type'], number> = {
    [BulkUpdateOperationType.CustomTypeInsert]: 0,
    [BulkUpdateOperationType.SliceInsert]: 1,
    [BulkUpdateOperationType.CustomTypeUpdate]: 2,
    [BulkUpdateOperationType.SliceUpdate]: 3,
    [BulkUpdateOperationType.CustomTypeDelete]: 4,
    [BulkUpdateOperationType.SliceDelete]: 5,
}

const DELETIONS = new Set<BulkUpdateOperation['type']>([
    BulkUpdateOperationType.CustomTypeDelete,
    BulkUpdateOperationType.SliceDelete,
])

/**
 * Computes the operations that turn `before` into `after`. Pass
 * (remote, local) to plan a push and (local, remote) to plan a pull.
 */
export const diffModels = (
    before: LocalModels,
    after: LocalModels,
): BulkUpdateOperation[] => {
    const transaction = createBulkUpdateTransaction()

    transaction.fromDiff(before, after)

    return [...transaction.operations].sort(
        (a, b) => ORDER[a.type] - ORDER[b.type] || a.id.localeCompare(b.id),
    )
}

export const isDeletion = (operation: BulkUpdateOperation): boolean =>
    DELETIONS.has(operation.type)

export const formatOperations = (operations: BulkUpdateOperation[]): string =>
    operations
        .map((operation) => `  ${LABELS[operation.type]}  ${operation.id}`)
        .join('\n')
