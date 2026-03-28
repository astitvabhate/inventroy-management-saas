const numberFormatter = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
})

export function formatNumber(value: number) {
    return numberFormatter.format(value)
}

export function formatCurrency(value: number) {
    return `Rs ${formatNumber(value)}`
}

export function formatDate(value: string | Date) {
    return dateFormatter.format(typeof value === 'string' ? new Date(value) : value)
}
