import { Component, Host, h, State } from '@stencil/core'
import { computedStates, events, state$, Todo } from './facade'
import { Subject, takeUntil } from 'rxjs'

@Component({
  tag: 'todo-app',
  styleUrl: 'todo-app.scss',
  shadow: true,
})
export class TodoApp {
  @State() todos: Todo[]
  @State() inputText: string
  @State() isLoading: boolean
  @State() addBtnDisabled: boolean

  disconnected$ = new Subject<void>()

  addTodoEvent = events.createAddTodoEvent(this.disconnected$)
  inputTextChangedEvent = events.createInputTextChangedEvent(this.disconnected$)
  componentLoadedEvent = events.createComponenetLoadedEvent(this.disconnected$)
  deleteTodoEvent = events.createDeleteTodoEvent(this.disconnected$)

  componentWillLoad() {
    state$.pipe(takeUntil(this.disconnected$)).subscribe(state => {
      this.todos = state.todos
      this.inputText = state.inputText
      this.isLoading = state.isLoading
    })

    computedStates.isAddBtnDisabled$.pipe(takeUntil(this.disconnected$)).subscribe(disabled => {
      this.addBtnDisabled = disabled
    })

    this.componentLoadedEvent.emit()
  }

  disconnectedCallback() {
    this.disconnected$.next()
  }

  private handleAddTodo = (ev: Event) => {
    ev.preventDefault()
    this.addTodoEvent.emit()
  }

  private handleInputTextChange = (ev: Event) => {
    const target = ev.target as HTMLInputElement
    this.inputTextChangedEvent.emit(target.value)
  }

  private createDeleteTodoHandler = (todo: Todo) => {
    const deleteTodoHandler = () => {
      this.deleteTodoEvent.emit(todo)
    }

    return deleteTodoHandler
  }

  render() {
    return (
      <Host>
        <form onSubmit={this.handleAddTodo}>
          <input type="text" placeholder="New Todo" onInput={this.handleInputTextChange} value={this.inputText} />
          <button disabled={this.addBtnDisabled}>Add Todo</button>
        </form>

        {this.isLoading ? (
          <h1>Loading...</h1>
        ) : (
          <ul>
            {this.todos.map(t => (
              <li>
                <h3>{t.text}</h3>
                <button class="delete-btn" onClick={this.createDeleteTodoHandler(t)}>
                  X
                </button>
              </li>
            ))}
          </ul>
        )}
      </Host>
    )
  }
}
