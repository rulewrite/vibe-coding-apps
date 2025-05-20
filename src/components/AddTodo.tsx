import { Button, HStack, Input, useToast } from '@chakra-ui/react';
import { useState } from 'react';

interface AddTodoProps {
  onAdd: (text: string) => void;
}

function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('');
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
    onAdd(text);
    setText('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <HStack>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="할 일을 입력하세요..."
          size="lg"
        />
        <Button type="submit" colorScheme="blue" size="lg">
          추가
        </Button>
      </HStack>
    </form>
  );
}

export default AddTodo;
