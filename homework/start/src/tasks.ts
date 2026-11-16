export type Filter = "all" | "open" | "done"

export interface Task {
    id: number
    title: string
    done: boolean
}

/**
 * Доска в том виде, в каком она приходит из хранилища. Строку 3 сохранила старая
 * форма ещё до issue #7: это название из одних пробелов, и оно всё ещё здесь.
 */
export const seedTasks: Task[] = [
    { id: 1, title: "Сдать лабораторную", done: false },
    { id: 2, title: "Купить продукты", done: true },
    { id: 3, title: "   ", done: false },
]

/** Доска считает название без непробельных символов отсутствующим названием. */
export function isBlankTitle(title: string): boolean {
    return title.trim().length === 0
}

/**
 * Создание задачи. Форма создания проверяла название всегда — проблема в пути
 * переименования ниже: старая форма сохраняла название без проверки.
 */
export function createTask(id: number, title: string): Task | undefined {
    const trimmed = title.trim() // remove for fail (a)
    //const trimmed = title // add for fail (a)
    if (trimmed.length === 0) return undefined
    return { id, title: trimmed, done: false }
}

/** Переименование существующей задачи. Пустое/пробельное название отклоняется. */
export function renameTask(tasks: Task[], id: number, title: string): Task[] {
    const trimmed = title.trim() // remove for fail (b)
    //const trimmed = title // add for fail (a)
    if (trimmed.length === 0) return tasks
    return tasks.map((task) => (task.id === id ? { ...task, title: trimmed } : task))
}

export function visibleTasks(tasks: Task[], filter: Filter): Task[] {
    const nonBlank = tasks.filter((task) => !isBlankTitle(task.title)) // remove for (c)
    //const nonBlank = tasks // add for (c)
    if (filter === "open") return nonBlank.filter((task) => !task.done)
    if (filter === "done") return nonBlank.filter((task) => task.done)
    return nonBlank
}

/**
 * Счётчик в шапке. Не считает пустые строки.
 */
export function openCount(tasks: Task[]): number {
    return tasks.filter((task) => !task.done && !isBlankTitle(task.title)).length
}
