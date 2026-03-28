import { ObjectId } from 'mongodb'

export function toObjectId(id: string) {
    return new ObjectId(id)
}

export function serializeId(id: ObjectId | string) {
    return typeof id === 'string' ? id : id.toHexString()
}

export function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

export function roundCurrency(value: number) {
    return Number(value.toFixed(2))
}
