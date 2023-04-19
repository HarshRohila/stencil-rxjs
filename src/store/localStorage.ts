import { Observable, of, throwError, delay, tap, map } from 'rxjs'
import { IStore } from '.'

const getOldData = <T>(modelName: string) => {
  const oldData = localStorage.getItem(modelName)
  return oldData ? (JSON.parse(oldData) as T[]) : []
}

const DELAY_TIME = 300

export class LocalStorageStore implements IStore {
  removeRecord(modelName: string, id: string | number): Observable<void> {
    return of(getOldData('todo')).pipe(
      map(records => {
        return records.filter(r => r['id'] !== id)
      }),
      tap(records => localStorage.setItem(modelName, JSON.stringify(records))),
      map(() => undefined),
      delay(DELAY_TIME),
    )
  }
  push<T>(modelName: string, data: T | T[]): Observable<void> {
    const getNewData = () => (Array.isArray(data) ? data : [data])

    const oldData = getOldData<T>(modelName)
    const newData = getNewData()

    const mergedData = JSON.stringify([...oldData, ...newData])

    localStorage.setItem(modelName, mergedData)
    return of(undefined).pipe(delay(DELAY_TIME))
  }

  findRecord<T>(modelName: string, id: string | number): Observable<T> {
    const records = getOldData<T>(modelName)

    const foundRecord = records.find(r => r['id'] === id)

    if (foundRecord) return of(foundRecord)

    throwError(() => Error(`Record with ${id} not found`))
  }

  findAll<T>(modelName: string): Observable<T[]> {
    return of(getOldData<T>(modelName)).pipe(delay(DELAY_TIME))
  }
}
