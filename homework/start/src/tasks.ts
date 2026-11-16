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

/** Убирает пробельные символы (включая таб, NBSP, zero-width space) с краёв. */
function trimBlank(title: string): string {
    return title.replace(/^[\s\u200B]+|[\s\u200B]+$/gu, "")
}

/** Доска считает название без непробельных символов отсутствующим названием. */
export function isBlankTitle(title: string): boolean {
    return trimBlank(title).length === 0
}

/**
 * Создание задачи. Название обрезается по краям; пустое отклоняется.
 */
export function createTask(id: number, title: string): Task | undefined {
    const trimmed = trimBlank(title)
    if (trimmed.length === 0) return undefined
    return { id, title: trimmed, done: false }
}

/** Переименование существующей задачи. Пустое название отклоняется, остаётся прежнее. */
export function renameTask(tasks: Task[], id: number, title: string): Task[] {
    const trimmed = trimBlank(title)
    if (trimmed.length === 0) return tasks
    return tasks.map((task) => (task.id === id ? { ...task, title: trimmed } : task))
}

export function visibleTasks(tasks: Task[], filter: Filter): Task[] {
    const nonBlank = tasks.filter((task) => !isBlankTitle(task.title))
    if (filter === "open") return nonBlank.filter((task) => !task.done)
    if (filter === "done") return nonBlank.filter((task) => task.done)
    return nonBlank
}

/**
 * Счётчик в шапке. Пустые строки не считаются открытыми задачами.
 */
export function openCount(tasks: Task[]): number {
    return tasks.filter((task) => !task.done && !isBlankTitle(task.title)).length
}
