import { BehaviorSubject, Subject, map, takeUntil } from 'rxjs'

interface State {
  todos: Todo[]
  inputText: string
}

export interface Todo {
  id: number
  text: string
}

const initialState: State = {
  todos: [
    {
      id: 1,
      text: 'First Todo',
    },
    {
      id: 2,
      text: 'Second Todo',
    },
  ],
  inputText: '',
}

const createTodo = (function () {
  let lastId = 2

  return function (text: string) {
    return {
      id: ++lastId,
      text,
    } as Todo
  }
})()

const setState = (partialState: Partial<State>) => {
  state$.next({ ...state$.value, ...partialState })
}

export const events = {
  createAddTodoEvent(disconnected$: Subject<void>) {
    const addTodo$ = new Subject<void>()

    addTodo$
      .pipe(
        map(() => state$.value.inputText),
        map(createTodo),
        takeUntil(disconnected$),
      )
      .subscribe(newTodo => {
        setState({ todos: [...state$.value.todos, newTodo], inputText: '' })
      })

    return {
      emit() {
        addTodo$.next()
      },
    }
  },

  createInputTextChangedEvent(disconnected$: Subject<void>) {
    const inputTextChanged$ = new Subject<string>()

    inputTextChanged$.pipe(takeUntil(disconnected$)).subscribe(text => {
      setState({ inputText: text })
    })

    return {
      emit(inputText: string) {
        inputTextChanged$.next(inputText)
      },
    }
  },
}

export const state$ = new BehaviorSubject<State>(initialState)
