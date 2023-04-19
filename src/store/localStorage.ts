import { Observable, of, throwError } from 'rxjs'
import { IStore } from '.'

const getOldData = <T>(modelName: string) => {
  const oldData = localStorage.getItem(modelName)
  return oldData ? (JSON.parse(oldData) as T[]) : []
}

export class LocalStorageStore implements IStore {
  push<T>(modelName: string, data: T | T[]): Observable<void> {
    const getNewData = () => (Array.isArray(data) ? data : [data])

    const oldData = getOldData<T>(modelName)
    const newData = getNewData()

    const mergedData = JSON.stringify([...oldData, ...newData])

    localStorage.setItem(modelName, mergedData)
    return of(undefined)
  }

  findRecord<T>(modelName: string, id: string | number): Observable<T> {
    const records = getOldData<T>(modelName)

    const foundRecord = records.find(r => r['id'] === id)

    if (foundRecord) return of(foundRecord)

    throwError(() => Error(`Record with ${id} not found`))
  }

  findAll<T>(modelName: string): Observable<T[]> {
    return of(getOldData<T>(modelName))
  }
}
