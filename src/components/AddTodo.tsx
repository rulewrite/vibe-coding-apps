import {
  Button,
  FormControl,
  FormLabel,
  Input,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';

interface AddTodoProps {
  onAdd: (text: string, dueDate: string | null) => void;
}

function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState('');
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      toast({
        title: '할 일을 입력해주세요',
        status: 'warning',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // 날짜가 입력되지 않은 경우 null로 설정
    const formattedDate = dueDate
      ? new Date(dueDate).toISOString().split('T')[0]
      : null;
    onAdd(text, formattedDate);
    setText('');
    setDueDate('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>할 일</FormLabel>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="할 일을 입력하세요..."
            size="lg"
          />
        </FormControl>
        <FormControl>
          <FormLabel>마감일</FormLabel>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            size="lg"
          />
        </FormControl>
        <Button type="submit" colorScheme="blue" size="lg">
          추가
        </Button>
      </VStack>
    </form>
  );
}

export default AddTodo;
