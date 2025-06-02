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
import { useCallback, useMemo, useState } from 'react';

interface AddTodoProps {
  onAdd: (text: string, dueDate: string | null) => void;
}

const DEFAULT_HOURS = 9;
const DEFAULT_MINUTES = 0;
const DEFAULT_SECONDS = 0;
const DEFAULT_MILLISECONDS = 0;

function AddTodo({ onAdd }: AddTodoProps) {
  const [text, setText] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(
      DEFAULT_HOURS,
      DEFAULT_MINUTES,
      DEFAULT_SECONDS,
      DEFAULT_MILLISECONDS
    );
    return tomorrow.toISOString().split('.')[0].slice(0, 16);
  });
  const toast = useToast();

  const getTomorrowDate = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(
      DEFAULT_HOURS,
      DEFAULT_MINUTES,
      DEFAULT_SECONDS,
      DEFAULT_MILLISECONDS
    );
    return tomorrow;
  }, []);

  const formatDateToString = useCallback((date: Date) => {
    return date.toISOString().split('.')[0].slice(0, 16);
  }, []);

  const setQuickDate = useCallback(
    (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      date.setHours(
        DEFAULT_HOURS,
        DEFAULT_MINUTES,
        DEFAULT_SECONDS,
        DEFAULT_MILLISECONDS
      );
      setDueDate(formatDateToString(date));
    },
    [formatDateToString]
  );

  const handleTextChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value.trim());
    },
    []
  );

  const handleDateChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const [, time] = dueDate.split('T');
      setDueDate(`${e.target.value}T${time}`);
    },
    [dueDate]
  );

  const handleTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const [date] = dueDate.split('T');
      setDueDate(`${date}T${e.target.value}`);
    },
    [dueDate]
  );

  const resetForm = useCallback(() => {
    setText('');
    setDueDate(formatDateToString(getTomorrowDate()));
  }, [formatDateToString, getTomorrowDate]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedText = text.trim();

      if (!trimmedText) {
        toast({
          title: '할 일을 입력해주세요',
          status: 'warning',
          duration: 2000,
          isClosable: true,
        });
        return;
      }

      onAdd(trimmedText, dueDate);
      resetForm();
    },
    [text, dueDate, onAdd, toast, resetForm]
  );

  const minDate = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  const quickDateButtons = useMemo(
    () => [
      { days: 1, label: '내일' },
      { days: 3, label: '3일 후' },
      { days: 7, label: '1주일' },
      { days: 14, label: '2주일' },
      { days: 30, label: '1개월' },
    ],
    []
  );

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>할 일</FormLabel>
          <Input
            value={text}
            onChange={handleTextChange}
            placeholder="할 일을 입력하세요..."
            size="lg"
          />
        </FormControl>
        <FormControl>
          <FormLabel>마감일</FormLabel>
          <VStack spacing={2} align="stretch">
            <ButtonGroup size="sm" isAttached variant="outline" spacing={1}>
              {quickDateButtons.map(({ days, label }) => (
                <Tooltip key={days} label={`${label} 오전 ${DEFAULT_HOURS}시`}>
                  <Button
                    onClick={() => setQuickDate(days)}
                    colorScheme="blue"
                    variant="outline"
                  >
                    {label}
                  </Button>
                </Tooltip>
              ))}
            </ButtonGroup>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <Input
                  type="date"
                  value={dueDate.split('T')[0]}
                  onChange={handleDateChange}
                  size="lg"
                  min={minDate}
                />
              </GridItem>
              <GridItem>
                <Input
                  type="time"
                  value={dueDate.split('T')[1]}
                  onChange={handleTimeChange}
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
