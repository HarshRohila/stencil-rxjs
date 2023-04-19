import { Observable } from 'rxjs'
import { LocalStorageStore } from './localStorage'

export interface IStore {
  push<T>(modelName: string, data: T | T[]): Observable<void>

  findRecord<T>(modelName: string, id: string | number): Observable<T>

  findAll<T>(modelName: string): Observable<T[]>
}

export const store = new LocalStorageStore() as IStore
