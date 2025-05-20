import { DeleteIcon } from '@chakra-ui/icons';
import {
  Checkbox,
  HStack,
  IconButton,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import type { Todo } from '../types';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  const toast = useToast();

  const handleDelete = (id: number) => {
    onDelete(id);
    toast({
      title: '할 일이 삭제되었습니다',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={4} width="100%" align="stretch">
      {todos.map((todo) => (
        <HStack
          key={todo.id}
          p={4}
          bg="white"
          borderRadius="md"
          boxShadow="sm"
          _hover={{ boxShadow: 'md' }}
          transition="all 0.2s"
        >
          <Checkbox
            isChecked={todo.completed}
            onChange={() => onToggle(todo.id)}
            colorScheme="blue"
            size="lg"
          />
          <Text
            flex={1}
            textDecoration={todo.completed ? 'line-through' : 'none'}
            color={todo.completed ? 'gray.500' : 'black'}
          >
            {todo.text}
          </Text>
          <IconButton
            aria-label="Delete todo"
            icon={<DeleteIcon />}
            onClick={() => handleDelete(todo.id)}
            colorScheme="red"
            variant="ghost"
          />
        </HStack>
      ))}
    </VStack>
  );
}

export default TodoList;
