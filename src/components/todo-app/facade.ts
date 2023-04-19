import { BehaviorSubject, Subject, map, takeUntil, switchMap, tap } from 'rxjs'
import { store } from '../../store'
import { v4 as uuidv4 } from 'uuid'

interface State {
  todos: Todo[]
  inputText: string
  isLoading: boolean
  addTodoLoading: boolean
  removingTodoId: Todo['id']
}

export interface Todo {
  id: string
  text: string
}

const initialState: State = {
  todos: [],
  inputText: '',
  isLoading: false,
  addTodoLoading: false,
  removingTodoId: '',
}

const createTodo = function (text: string) {
  return {
    id: uuidv4(),
    text,
  } as Todo
}

const setState = (partialState: Partial<State>) => {
  state$.next({ ...state$.value, ...partialState })
}

export const events = {
  createDeleteTodoEvent(disconnected$: Subject<void>) {
    const deleteTodo$ = new Subject<Todo>()

    deleteTodo$
      .pipe(
        tap(t => setState({ removingTodoId: t.id })),
        switchMap(todo => store.removeRecord('todo', todo.id).pipe(map(() => todo))),
        tap(() => setState({ removingTodoId: '' })),
        takeUntil(disconnected$),
      )
      .subscribe(todo => {
        setState({ todos: state$.value.todos.filter(t => t.id !== todo.id) })
      })

    return {
      emit(todo: Todo) {
        deleteTodo$.next(todo)
      },
    }
  },
  createComponenetLoadedEvent(disconnected$: Subject<void>) {
    const componentLoaded$ = new Subject<void>()

    componentLoaded$
      .pipe(
        tap(() => setState({ isLoading: true })),
        switchMap(() => store.findAll<Todo>('todo')),
        tap(() => setState({ isLoading: false })),
        takeUntil(disconnected$),
      )
      .subscribe(todos => {
        setState({ todos })
      })

    return {
      emit() {
        componentLoaded$.next()
      },
    }
  },
  createAddTodoEvent(disconnected$: Subject<void>) {
    const addTodo$ = new Subject<void>()

    addTodo$
      .pipe(
        map(() => state$.value.inputText),
        map(createTodo),
        tap(() => setState({ addTodoLoading: true })),
        switchMap(newTodo => store.push('todo', newTodo).pipe(map(() => newTodo))),
        tap(() => setState({ addTodoLoading: false })),
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

export const computedStates = {
  isAddBtnDisabled$: state$.pipe(map(state => state.inputText.length === 0 || state.addTodoLoading)),
}
