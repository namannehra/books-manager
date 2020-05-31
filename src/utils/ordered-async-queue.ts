export interface OrderedAsyncQueueOptions<T> {
    tasks: Iterable<() => Promise<T>>
    maxConcurrency?: number
    onAllDone?: () => void
}

interface PendingTaskInfo {
    status: 'pending'
}

interface FulfilledTaskInfo<T> {
    status: 'fulfilled'
    value: T
}

interface RejectedTaskInfo {
    status: 'rejected'
    reason: any
}

type TaskInfo<T> = PendingTaskInfo | FulfilledTaskInfo<T> | RejectedTaskInfo

export const orderedAsyncQueue = <T>(options: OrderedAsyncQueueOptions<T>) => {
    const maxConcurrency = options.maxConcurrency ?? Infinity
    const iterator = options.tasks[Symbol.iterator]()
    const queue: TaskInfo<T>[] = []
    const queueNext = async (task: () => Promise<T>) => {
        const taskInfo: PendingTaskInfo = {
            status: 'pending',
        }
        queue.push(taskInfo)
        try {
            const value = await task()
            const newTaskInfo: FulfilledTaskInfo<T> = {
                status: 'fulfilled',
                value,
            }
            Object.assign(taskInfo, newTaskInfo)
        } catch (error) {
            const newTaskInfo: RejectedTaskInfo = {
                status: 'rejected',
                reason: error,
            }
            Object.assign(taskInfo, newTaskInfo)
        } finally {
            while (queue[0]) {
                if (queue[0].status === 'pending') {
                    break
                }
                queue.shift()
            }
            const result = iterator.next()
            if (result.done) {
                if (!queue.length) {
                    options.onAllDone?.()
                }
            } else {
                queueNext(result.value)
            }
        }
    }
    for (let i = 0; i < maxConcurrency; i++) {
        const result = iterator.next()
        if (result.done) {
            break
        }
        queueNext(result.value)
    }
}
