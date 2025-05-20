import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  Badge,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useState } from 'react';
import type { DropResult } from 'react-beautiful-dnd';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import type { Todo } from '../types';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  onUpdate: (
    id: number,
    updates: { text?: string; dueDate?: string | null }
  ) => void;
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

const DragHandleIcon = () => (
  <Box
    width="20px"
    height="20px"
    display="flex"
    flexDirection="column"
    justifyContent="center"
    alignItems="center"
    gap="2px"
  >
    <Box width="100%" height="2px" bg="gray.400" borderRadius="full" />
    <Box width="100%" height="2px" bg="gray.400" borderRadius="full" />
    <Box width="100%" height="2px" bg="gray.400" borderRadius="full" />
  </Box>
);

const TodoItem = ({
  todo,
  index,
  onToggle,
  onDelete,
  onUpdate,
}: {
  todo: Todo;
  index: number;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (
    id: number,
    updates: { text?: string; dueDate?: string | null }
  ) => void;
}) => {
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editDueDate, setEditDueDate] = useState<string | null>(todo.dueDate);

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

  const handleEdit = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsEditing(true);
  }, []);

  const handleUpdate = useCallback(() => {
    if (editText.trim() === '') {
      toast({
        title: '할 일 내용을 입력해주세요',
        status: 'warning',
        duration: TOAST_DURATION,
        isClosable: true,
      });
      return;
    }

    onUpdate(todo.id, { text: editText.trim() });
    setIsEditing(false);
    toast({
      title: '할 일이 수정되었습니다',
      status: 'success',
      duration: TOAST_DURATION,
      isClosable: true,
    });
  }, [editText, onUpdate, todo.id, toast]);

  const handleDueDateUpdate = useCallback(() => {
    onUpdate(todo.id, { dueDate: editDueDate });
    onClose();
    toast({
      title: '마감일이 수정되었습니다',
      status: 'success',
      duration: TOAST_DURATION,
      isClosable: true,
    });
  }, [editDueDate, onUpdate, todo.id, onClose, toast]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleUpdate();
      } else if (e.key === 'Escape') {
        setIsEditing(false);
        setEditText(todo.text);
      }
    },
    [handleUpdate, todo.text]
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

  return (
    <>
      <Draggable draggableId={String(todo.id)} index={index}>
        {(provided, snapshot) => (
          <div ref={provided.innerRef} {...provided.draggableProps}>
            <HStack
              p={4}
              bg="white"
              borderRadius="md"
              boxShadow={snapshot.isDragging ? 'lg' : 'sm'}
              _hover={{ boxShadow: 'md' }}
              spacing={4}
              transition="all 0.2s"
              transform={snapshot.isDragging ? 'scale(1.02)' : 'none'}
            >
              <Box
                {...provided.dragHandleProps}
                p={2}
                borderRadius="md"
                cursor="grab"
                _hover={{ bg: 'gray.50' }}
                _active={{ cursor: 'grabbing', bg: 'gray.100' }}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <DragHandleIcon />
              </Box>
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
                {isEditing ? (
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={handleUpdate}
                    onKeyDown={handleKeyPress}
                    autoFocus
                    size="lg"
                    variant="filled"
                    _hover={{ bg: 'gray.100' }}
                    _focus={{ bg: 'white', borderColor: 'blue.500' }}
                  />
                ) : (
                  <Text
                    textDecoration={todo.completed ? 'line-through' : 'none'}
                    color={todo.completed ? 'gray.500' : 'black'}
                    fontSize="lg"
                  >
                    {todo.text}
                  </Text>
                )}
                {todo.dueDate && (
                  <Badge
                    colorScheme={getDateStatus(todo.dueDate) || 'gray'}
                    fontSize="sm"
                    px={2}
                    py={1}
                    borderRadius="md"
                    cursor="pointer"
                    onClick={onOpen}
                    _hover={{ opacity: 0.8 }}
                  >
                    마감일: {formatDate(todo.dueDate)}
                  </Badge>
                )}
                {!todo.dueDate && (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="blue"
                    onClick={onOpen}
                    px={2}
                    py={1}
                    height="auto"
                    fontSize="sm"
                  >
                    마감일 추가
                  </Button>
                )}
              </VStack>
              <HStack spacing={2}>
                <IconButton
                  aria-label="Edit todo"
                  icon={<EditIcon />}
                  onClick={handleEdit}
                  colorScheme="blue"
                  variant="ghost"
                  size="lg"
                  padding={2}
                  _hover={{ bg: 'blue.50' }}
                  display={isEditing ? 'none' : 'flex'}
                />
                <IconButton
                  aria-label="Delete todo"
                  icon={<DeleteIcon />}
                  onClick={handleDelete}
                  colorScheme="red"
                  variant="ghost"
                  size="lg"
                  padding={2}
                  _hover={{ bg: 'red.50' }}
                  display={isEditing ? 'none' : 'flex'}
                />
              </HStack>
            </HStack>
          </div>
        )}
      </Draggable>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>마감일 수정</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>마감일</FormLabel>
              <Input
                type="datetime-local"
                value={editDueDate || ''}
                onChange={(e) => setEditDueDate(e.target.value || null)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              취소
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleDueDateUpdate}
              isDisabled={editDueDate === todo.dueDate}
            >
              저장
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

function TodoList({
  todos,
  onToggle,
  onDelete,
  onReorder,
  onUpdate,
}: TodoListProps) {
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const startIndex = result.source.index;
      const endIndex = result.destination.index;

      if (startIndex === endIndex) return;

      onReorder(startIndex, endIndex);
    },
    [onReorder]
  );

  return (
    <Box width="100%">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="todo-list">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              width="100%"
            >
              <VStack spacing={4} width="100%" align="stretch">
                {todos.map((todo, index) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    index={index}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                  />
                ))}
                {provided.placeholder}
              </VStack>
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Box>
  );
}

export default TodoList;
