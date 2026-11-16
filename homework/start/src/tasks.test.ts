import { describe, expect, it } from "vitest"
import { createTask, renameTask, visibleTasks, openCount, seedTasks } from "./tasks"

// Два теста, с которыми поставляется стартер. Они проходят и не покрывают
// поведение, описанное в ISSUE-7.md.
describe("базовая доска", () => {
    it("создаёт задачу и обрезает название", () => {
        const task = createTask(9, "  Купить хлеб  ")
        expect(task?.title).toBe("Купить хлеб")
    })

    it("фильтрует готовые задачи", () => {
        expect(visibleTasks(seedTasks, "done").map((task) => task.id)).toEqual([2])
    })
})

// ─────────────────────────────────────────────────────────────
// R1. Переименование в строку из одних пробельных символов
//     отклоняется, остаётся прежнее название; пробелы по краям
//     обрезаются. Пробельные: пробел, табуляция, U+00A0.
// ─────────────────────────────────────────────────────────────
describe("R1: переименование и обрезка пробелов", () => {
    const base = () => [
        { id: 1, title: "Сдать лабораторную", done: false },
        { id: 2, title: "Купить продукты", done: true },
    ]

    it("отклоняет переименование в строку из одних пробелов", () => {
        const tasks = base()
        const result = renameTask(tasks, 1, "   ")
        expect(result.find((t) => t.id === 1)?.title).toBe("Сдать лабораторную")
    })

    it("отклоняет переименование в строку из одних табуляций", () => {
        const tasks = base()
        const result = renameTask(tasks, 1, "\t\t")
        expect(result.find((t) => t.id === 1)?.title).toBe("Сдать лабораторную")
    })

    it("отклоняет переименование в строку из одних U+00A0", () => {
        const tasks = base()
        const result = renameTask(tasks, 1, "\u00A0\u00A0")
        expect(result.find((t) => t.id === 1)?.title).toBe("Сдать лабораторную")
    })

    it("обрезает пробелы по краям при переименовании", () => {
        const tasks = base()
        const result = renameTask(tasks, 1, "  Новая задача  ")
        expect(result.find((t) => t.id === 1)?.title).toBe("Новая задача")
    })

    it("обрезает табуляцию и U+00A0 по краям, оставляя содержимое", () => {
        const tasks = base()
        const result = renameTask(tasks, 2, "\t\u00A0Купить хлеб\u00A0\t")
        expect(result.find((t) => t.id === 2)?.title).toBe("Купить хлеб")
    })

    it("createTask обрезает пробелы и отбивает пустое название", () => {
        expect(createTask(9, "  Купить хлеб  ")?.title).toBe("Купить хлеб")
        expect(createTask(9, "   ")).toBeUndefined()
        expect(createTask(9, "\t\u00A0")).toBeUndefined()
    })
})

// ─────────────────────────────────────────────────────────────
// R2. Доска не показывает пустые строки, включая уже
//     сохранённую в данных (id 3 с названием "   ").
// ─────────────────────────────────────────────────────────────
describe("R2: доска не показывает пустые строки", () => {
    it("не показывает унаследованную пустую строку в фильтре all", () => {
        const ids = visibleTasks(seedTasks, "all").map((t) => t.id)
        expect(ids).not.toContain(3)
        expect(ids.sort()).toEqual([1, 2])
    })

    it("не показывает унаследованную пустую строку в фильтре open", () => {
        const ids = visibleTasks(seedTasks, "open").map((t) => t.id)
        expect(ids).not.toContain(3)
        expect(ids).toEqual([1])
    })

    it("не показывает пустые строки и в фильтре done", () => {
        const ids = visibleTasks(seedTasks, "done").map((t) => t.id)
        expect(ids).toEqual([2])
    })

    it("не мутирует исходный массив seedTasks", () => {
        visibleTasks(seedTasks, "all")
        expect(seedTasks).toHaveLength(3)
        expect(seedTasks.find((t) => t.id === 3)?.title).toBe("   ")
    })
})

// ─────────────────────────────────────────────────────────────
// R3. Счётчик «Открытых» считает так же, как список:
//     пустая строка не считается открытой задачей.
// ─────────────────────────────────────────────────────────────
describe("R3: счётчик открытых согласован со списком", () => {
    it("не считает унаследованную пустую строку среди открытых", () => {
        expect(openCount(seedTasks)).toBe(1)
    })

    it("счётчик совпадает с длиной списка открытых", () => {
        expect(openCount(seedTasks)).toBe(visibleTasks(seedTasks, "open").length)
    })

    it("согласованность держится и на произвольных данных", () => {
        const tasks = [
            { id: 10, title: "  ", done: false },          // пустая, открытая
            { id: 11, title: "\t", done: false },          // пустая, открытая
            { id: 12, title: "Реальная задача", done: false },
            { id: 13, title: "   ", done: true },          // пустая, но done
        ]
        expect(openCount(tasks)).toBe(1)
        expect(openCount(tasks)).toBe(visibleTasks(tasks, "open").length)
    })
})