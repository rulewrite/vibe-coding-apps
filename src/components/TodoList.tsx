import { DeleteIcon } from '@chakra-ui/icons';
import {
  Badge,
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getDateStatus = (dateString: string | null) => {
    if (!dateString) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);

    if (dueDate < today) return 'red';
    if (dueDate.getTime() === today.getTime()) return 'orange';
    return 'green';
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
          spacing={4}
          transition="all 0.2s"
        >
          <Box
            as="span"
            display="flex"
            alignItems="center"
            cursor="pointer"
            onClick={() => onToggle(todo.id)}
            _hover={{ bg: 'gray.50' }}
            p={2}
            borderRadius="md"
          >
            <Checkbox
              isChecked={todo.completed}
              onChange={() => onToggle(todo.id)}
              colorScheme="blue"
              size="lg"
              padding={2}
            />
          </Box>
          <VStack flex={1} align="start" spacing={1}>
            <Text
              textDecoration={todo.completed ? 'line-through' : 'none'}
              color={todo.completed ? 'gray.500' : 'black'}
              fontSize="lg"
            >
              {todo.text}
            </Text>
            {todo.dueDate && (
              <Badge
                colorScheme={getDateStatus(todo.dueDate) || 'gray'}
                fontSize="sm"
                px={2}
                py={1}
                borderRadius="md"
              >
                마감일: {formatDate(todo.dueDate)}
              </Badge>
            )}
          </VStack>
          <Box as="span" display="flex" alignItems="center">
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
      ))}
    </VStack>
  );
}

export default TodoList;
