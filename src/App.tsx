import { ChakraProvider, Container, Heading, VStack } from '@chakra-ui/react';
import { useState } from 'react';
import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';
import type { Todo } from './types';

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = (text: string, dueDate: string | null) => {
    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
      dueDate,
    };
    setTodos([...todos, newTodo]);
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <ChakraProvider>
      <Container maxW="container.md" py={10}>
        <VStack spacing={8}>
          <Heading>TODO 앱</Heading>
          <AddTodo onAdd={addTodo} />
          <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
        </VStack>
      </Container>
    </ChakraProvider>
  );
}

export default App;
