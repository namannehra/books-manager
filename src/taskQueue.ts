type Task<K, V> = (
    keys: K[],
    callback?: Callback<K, V>,
    errorCallback?: ErrorCallback<K>,
) => void

type Callback<K, V> = (key: K, value: V) => void

type ErrorCallback<K> = (key: K, error: Error) => void

export const taskQueue = <K, V>(
    task: Task<K, V>,
    keys: K[],
    callback: Callback<K, V>,
    errorCallback: ErrorCallback<K>
) => new Promise(resolve => {
    const pending = keys.slice()
    const values = new Map()
    const errors = new Map()
    const clear = () => {
        while (pending.length) {
            let top = pending[0]
            if (values.has(top)) {
                callback(pending.shift() as K, values.get(top))
            } else if (errors.has(top)) {
                errorCallback(pending.shift() as K, errors.get(top))
            } else {
                return
            }
        }
        resolve()
    }
    task(keys, (key, value) => {
        values.set(key, value)
        clear()
    }, (key, error) => {
        errors.set(key, error)
        clear()
    })
})