import { DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
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

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // 이벤트 버블링 방지
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
        <Box
          key={todo.id}
          as="button"
          onClick={() => onToggle(todo.id)}
          width="100%"
          textAlign="left"
          _hover={{ transform: 'translateY(-2px)' }}
          transition="all 0.2s"
        >
          <HStack
            p={4}
            bg="white"
            borderRadius="md"
            boxShadow="sm"
            _hover={{ boxShadow: 'md' }}
            spacing={4}
          >
            <Box
              as="span"
              onClick={(e) => e.stopPropagation()}
              display="flex"
              alignItems="center"
            >
              <Checkbox
                isChecked={todo.completed}
                onChange={() => onToggle(todo.id)}
                colorScheme="blue"
                size="lg"
                padding={2}
              />
            </Box>
            <Text
              flex={1}
              textDecoration={todo.completed ? 'line-through' : 'none'}
              color={todo.completed ? 'gray.500' : 'black'}
              fontSize="lg"
              py={2}
            >
              {todo.text}
            </Text>
            <Box
              as="span"
              onClick={(e) => e.stopPropagation()}
              display="flex"
              alignItems="center"
            >
              <IconButton
                aria-label="Delete todo"
                icon={<DeleteIcon />}
                onClick={(e) => handleDelete(e, todo.id)}
                colorScheme="red"
                variant="ghost"
                size="lg"
                padding={2}
                _hover={{ bg: 'red.50' }}
              />
            </Box>
          </HStack>
        </Box>
      ))}
    </VStack>
  );
}

export default TodoList;
