export const formatShortTime = (value: string | Date) =>
    new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(value))

export const formatLastSeen = (value: string | Date) =>
    new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit'
    }).format(new Date(value))
