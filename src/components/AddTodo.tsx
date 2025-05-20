import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Input,
  Tooltip,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useState } from 'react';

interface AddTodoProps {
  onAdd: (text: string, dueDate: string | null) => void;
}

function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString().split('.')[0].slice(0, 16);
  });
  const toast = useToast();

  const setQuickDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(9, 0, 0, 0);
    setDueDate(date.toISOString().split('.')[0].slice(0, 16));
  };

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

    onAdd(text, dueDate);
    setText('');
    // 입력 후 다시 내일 오전 9시로 초기화
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setDueDate(tomorrow.toISOString().split('.')[0].slice(0, 16));
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
          <VStack spacing={2} align="stretch">
            <ButtonGroup size="sm" isAttached variant="outline" spacing={1}>
              <Tooltip label="내일 오전 9시">
                <Button
                  onClick={() => setQuickDate(1)}
                  colorScheme="blue"
                  variant="outline"
                >
                  내일
                </Button>
              </Tooltip>
              <Tooltip label="3일 후 오전 9시">
                <Button
                  onClick={() => setQuickDate(3)}
                  colorScheme="blue"
                  variant="outline"
                >
                  3일 후
                </Button>
              </Tooltip>
              <Tooltip label="일주일 후 오전 9시">
                <Button
                  onClick={() => setQuickDate(7)}
                  colorScheme="blue"
                  variant="outline"
                >
                  1주일
                </Button>
              </Tooltip>
              <Tooltip label="2주일 후 오전 9시">
                <Button
                  onClick={() => setQuickDate(14)}
                  colorScheme="blue"
                  variant="outline"
                >
                  2주일
                </Button>
              </Tooltip>
              <Tooltip label="한 달 후 오전 9시">
                <Button
                  onClick={() => setQuickDate(30)}
                  colorScheme="blue"
                  variant="outline"
                >
                  1개월
                </Button>
              </Tooltip>
            </ButtonGroup>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <Input
                  type="date"
                  value={dueDate.split('T')[0]}
                  onChange={(e) => {
                    const [date] = dueDate.split('T');
                    setDueDate(`${e.target.value}T${date.split('T')[1]}`);
                  }}
                  size="lg"
                  min={new Date().toISOString().split('T')[0]}
                />
              </GridItem>
              <GridItem>
                <Input
                  type="time"
                  value={dueDate.split('T')[1]}
                  onChange={(e) => {
                    const [date] = dueDate.split('T');
                    setDueDate(`${date}T${e.target.value}`);
                  }}
                  size="lg"
                />
              </GridItem>
            </Grid>
          </VStack>
        </FormControl>
        <Button type="submit" colorScheme="blue" size="lg">
          추가
        </Button>
      </VStack>
    </form>
  );
}

export default AddTodo;
