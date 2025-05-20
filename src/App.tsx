import { ChakraProvider, Container, Heading, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import AddTodo from './components/AddTodo';
import TodoList from './components/TodoList';
import type { Todo } from './types';

// 로컬 스토리지 키
const STORAGE_KEY = 'todos';

function App() {
  // 초기 상태를 로컬 스토리지에서 불러오기
  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem(STORAGE_KEY);
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  // todos가 변경될 때마다 로컬 스토리지에 저장
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

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
