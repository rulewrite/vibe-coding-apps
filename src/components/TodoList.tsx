import { CheckIcon, CloseIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
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
  keyframes,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
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
  const { colorMode, toggleColorMode } = useColorMode();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(todo.text);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [editDueDate, setEditDueDate] = useState<string | null>(todo.dueDate);
  const [clickCount, setClickCount] = useState(0);
  const [showSecret, setShowSecret] = useState(false);

  // 비밀 메시지 이스터에그 감지
  useEffect(() => {
    const text = todo.text.toLowerCase();
    if (text.includes('secret') || text.includes('비밀')) {
      setShowSecret(true);
      const timer = setTimeout(() => setShowSecret(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [todo.text]);

  // 이스터에그: Konami 코드 감지
  useEffect(() => {
    const konamiCode = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
          toast({
            title: '🎉 이스터에그 발견!',
            description: 'Konami 코드를 입력하셨네요!',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          konamiIndex = 0;
        }
      } else {
        konamiIndex = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toast]);

  // 이스터에그: 제목 더블클릭
  const handleTitleClick = useCallback(() => {
    setClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 5) {
        toast({
          title: '🎨 테마 변경!',
          description: '다크 모드가 토글되었습니다.',
          status: 'info',
          duration: 2000,
          isClosable: true,
        });
        toggleColorMode();
        return 0;
      }
      return newCount;
    });
  }, [toast, toggleColorMode]);

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const text = e.target.value.toLowerCase();
      if (text.includes('konami') || text.includes('코나미')) {
        toast({
          title: '🎮 게임 시작!',
          description: 'Konami 코드를 입력해보세요! (↑↑↓↓←→←→BA)',
          status: 'info',
          duration: 3000,
          isClosable: true,
        });
      }
      setEditText(e.target.value);
    },
    [toast]
  );

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

    onUpdate(todo.id, {
      text: editText.trim(),
      dueDate: editDueDate,
    });
    setIsEditing(false);
    toast({
      title: '할 일이 수정되었습니다',
      status: 'success',
      duration: TOAST_DURATION,
      isClosable: true,
    });
  }, [editText, editDueDate, onUpdate, todo.id, toast]);

  const handleCancel = useCallback(() => {
    setEditText(todo.text);
    setEditDueDate(todo.dueDate);
    setIsEditing(false);
  }, [todo.text, todo.dueDate]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleUpdate();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    },
    [handleUpdate, handleCancel]
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
              position="relative"
            >
              {showSecret && (
                <Box
                  position="absolute"
                  top="-20px"
                  left="50%"
                  transform="translateX(-50%)"
                  fontSize="sm"
                  color="purple.500"
                  fontWeight="bold"
                  animation={`${keyframes({
                    '0%': { transform: 'translateX(-50%) translateY(0)' },
                    '50%': { transform: 'translateX(-50%) translateY(-10px)' },
                    '100%': { transform: 'translateX(-50%) translateY(0)' },
                  })} 1s infinite`}
                >
                  🎉 비밀을 발견하셨네요!
                </Box>
              )}
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
              <VStack flex={1} align="start" spacing={2}>
                {isEditing ? (
                  <>
                    <Input
                      value={editText}
                      onChange={handleTextChange}
                      onKeyDown={handleKeyPress}
                      autoFocus
                      size="lg"
                      variant="filled"
                      _hover={{ bg: 'gray.100' }}
                      _focus={{ bg: 'white', borderColor: 'blue.500' }}
                    />
                    <FormControl>
                      <FormLabel fontSize="sm" mb={1}>
                        마감일
                      </FormLabel>
                      <Input
                        type="datetime-local"
                        value={editDueDate || ''}
                        onChange={(e) => setEditDueDate(e.target.value || null)}
                        size="md"
                      />
                    </FormControl>
                  </>
                ) : (
                  <>
                    <Tooltip label="제목을 5번 클릭하면 테마가 바뀝니다!">
                      <Text
                        textDecoration={
                          todo.completed ? 'line-through' : 'none'
                        }
                        color={todo.completed ? 'gray.500' : 'black'}
                        fontSize="lg"
                        onClick={handleTitleClick}
                        cursor="pointer"
                        _hover={{ color: 'blue.500' }}
                      >
                        {todo.text}
                      </Text>
                    </Tooltip>
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
                  </>
                )}
              </VStack>
              <HStack spacing={2}>
                {isEditing ? (
                  <>
                    <IconButton
                      aria-label="Save changes"
                      icon={<CheckIcon />}
                      onClick={handleUpdate}
                      colorScheme="green"
                      variant="ghost"
                      size="lg"
                      padding={2}
                      _hover={{ bg: 'green.50' }}
                    />
                    <IconButton
                      aria-label="Cancel editing"
                      icon={<CloseIcon />}
                      onClick={handleCancel}
                      colorScheme="gray"
                      variant="ghost"
                      size="lg"
                      padding={2}
                      _hover={{ bg: 'gray.50' }}
                    />
                  </>
                ) : (
                  <>
                    <IconButton
                      aria-label="Edit todo"
                      icon={<EditIcon />}
                      onClick={handleEdit}
                      colorScheme="blue"
                      variant="ghost"
                      size="lg"
                      padding={2}
                      _hover={{ bg: 'blue.50' }}
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
                    />
                  </>
                )}
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
              onClick={handleUpdate}
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
