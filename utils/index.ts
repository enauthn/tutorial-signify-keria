import { Operation, SignifyClient } from 'signify-ts';
import { RetryOptions, retry } from './retry';
/**
 * Poll for operation to become completed.
 * Removes completed operation
 */
export async function waitOperation<T = any>(
    client: SignifyClient,
    op: Operation<T> | string,
    options: RetryOptions = {}
): Promise<Operation<T>> {
    const ctrl = new AbortController();
    options.signal?.addEventListener('abort', (e: Event) => {
        const s = e.target as AbortSignal;
        ctrl.abort(s.reason);
    });
    let name: string;
    if (typeof op === 'string') {
        name = op;
    } else if (typeof op === 'object' && 'name' in op) {
        name = op.name;
    } else {
        throw new Error();
    }
    const result: Operation<T> = await retry(async () => {
        let t: Operation<T>;
        try {
            t = await getOperation<T>(client, name, true);
        } catch (e) {
            ctrl.abort(e);
            throw e;
        }
        if (t.done !== true) {
            throw new Error(`Operation ${name} not done`);
        }
        console.log('DONE', name);
        return t;
    }, options);
    let i: Operation | undefined = result;
    while (i !== undefined) {
        // console.log('DELETE', i.name);
        await client.operations().delete(i.name);
        i = i.metadata?.depends;
    }
    return result;
}

/**
 * Get status of operation.
 * If parameter recurse is set then also checks status of dependent operations.
 */
async function getOperation<T>(
    client: SignifyClient,
    name: string,
    recurse?: boolean
): Promise<Operation<T>> {
    const result = await client.operations().get<T>(name);
    if (recurse === true) {
        let i: Operation | undefined = result;
        while (result.done && i?.metadata?.depends !== undefined) {
            let depends: Operation = await client
                .operations()
                .get(i.metadata.depends.name);
            result.done = result.done && depends.done;
            i.metadata.depends = depends;
            i = depends.metadata?.depends;
        }
    }
    return result;
}
