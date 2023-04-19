import { Component, Host, h, State } from '@stencil/core'
import { events, state$, Todo } from './facade'
import { Subject, takeUntil } from 'rxjs'

@Component({
  tag: 'todo-app',
  shadow: true,
})
export class TodoApp {
  @State() todos: Todo[]
  @State() inputText: string

  disconnected$ = new Subject<void>()

  addTodoEvent = events.createAddTodoEvent(this.disconnected$)
  inputTextChangedEvent = events.createInputTextChangedEvent(this.disconnected$)

  componentWillLoad() {
    state$.pipe(takeUntil(this.disconnected$)).subscribe(state => {
      this.todos = state.todos
      this.inputText = state.inputText
    })
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

  render() {
    return (
      <Host>
        <form onSubmit={this.handleAddTodo}>
          <input type="text" placeholder="New Todo" onInput={this.handleInputTextChange} value={this.inputText} />
          <button>Add Todo</button>
        </form>

        <ul>
          {this.todos.map(t => (
            <li>
              <h3>{t.text}</h3>
            </li>
          ))}
        </ul>
      </Host>
    )
  }
}
