import { filter, debounceTime } from 'rxjs/operators'
import { Subject, BehaviorSubject } from 'rxjs'

const subject = new Subject()
const behSubject = new BehaviorSubject<any>(0)

export function ibukiEmit(id: string, options: any) {
    subject.next({ id: id, data: options })
}

export function ibukiFilterOn(id: string) {
    return subject.pipe(filter((d: any) => d.id === id))
}

export function ibukiHotEmit(id: string, options: any) {
    behSubject.next({ id: id, data: options })
}

export function ibukiHotFilterOn(id: string) {
    return behSubject.pipe(filter((d: any) => d.id === id))
}

export function ibukiDdebounceEmit(id: string, options: any) {
    subject.next({ id: id, data: options })
}

export function ibukiDebounceFilterOn(id: string, debouncePeriod: number = 1000) {
    return subject
        .pipe(filter((d: any) => d.id === id))
        .pipe(debounceTime(debouncePeriod))
}


// export { emit, filterOn, hotEmit, hotFilterOn, debounceEmit, debounceFilterOn }