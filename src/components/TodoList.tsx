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

  const handleDelete = (e: React.MouseEvent<HTMLButtonElement>, id: number) => {
    e.stopPropagation();
    onDelete(id);
    toast({
      title: '할 일이 삭제되었습니다',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: number
  ) => {
    e.stopPropagation();
    onToggle(id);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getDateStatus = (dateString: string | null) => {
    if (!dateString) return null;
    const now = new Date();
    const dueDate = new Date(dateString);

    if (dueDate < now) return 'red';
    if (dueDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000)
      return 'orange'; // 24시간 이내
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
            p={2}
            borderRadius="md"
          >
            <Checkbox
              isChecked={todo.completed}
              onChange={(e) => handleCheckboxChange(e, todo.id)}
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
