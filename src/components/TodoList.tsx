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
import { useCallback, useMemo } from 'react';
import type { Todo } from '../types';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const TOAST_DURATION = 2000;

const TodoItem = ({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  const toast = useToast();

  const handleDelete = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      onDelete(todo.id);
      toast({
        title: '할 일이 삭제되었습니다',
        status: 'info',
        duration: TOAST_DURATION,
        isClosable: true,
      });
    },
    [onDelete, todo.id, toast]
  );

  const handleCheckboxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.stopPropagation();
      onToggle(todo.id);
    },
    [onToggle, todo.id]
  );

  const formatDate = useCallback((dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', DATE_FORMAT_OPTIONS);
  }, []);

  const getDateStatus = useCallback((dateString: string | null) => {
    if (!dateString) return null;
    const now = new Date();
    const dueDate = new Date(dateString);

    if (dueDate < now) return 'red';
    if (dueDate.getTime() - now.getTime() < ONE_DAY_MS) return 'orange';
    return 'green';
  }, []);

  const formattedDate = useMemo(
    () => (todo.dueDate ? formatDate(todo.dueDate) : null),
    [todo.dueDate, formatDate]
  );

  const dateStatus = useMemo(
    () => (todo.dueDate ? getDateStatus(todo.dueDate) : null),
    [todo.dueDate, getDateStatus]
  );

  return (
    <HStack
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
          onChange={handleCheckboxChange}
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
        {formattedDate && (
          <Badge
            colorScheme={dateStatus || 'gray'}
            fontSize="sm"
            px={2}
            py={1}
            borderRadius="md"
          >
            마감일: {formattedDate}
          </Badge>
        )}
      </VStack>
      <Box as="span" display="flex" alignItems="center">
        <IconButton
          aria-label="Delete todo"
          icon={<DeleteIcon />}
          onClick={handleDelete}
          colorScheme="red"
          variant="ghost"
          size="lg"
          padding={2}
          _hover={{ bg: 'red.50' }}
        />
      </Box>
    </HStack>
  );
};

function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  const todoItems = useMemo(
    () =>
      todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      )),
    [todos, onToggle, onDelete]
  );

  return (
    <VStack spacing={4} width="100%" align="stretch">
      {todoItems}
    </VStack>
  );
}

export default TodoList;
