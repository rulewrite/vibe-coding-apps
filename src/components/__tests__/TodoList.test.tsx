import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import type { Todo } from '../../types';
import TodoList from '../TodoList';

describe('TodoList 컴포넌트', () => {
  const mockTodos: Todo[] = [
    {
      id: 1,
      text: '테스트 할 일 1',
      completed: false,
      dueDate: '2024-03-20T09:00',
    },
    {
      id: 2,
      text: '테스트 할 일 2',
      completed: true,
      dueDate: null,
    },
  ];

  const mockOnToggle = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <ChakraProvider>
        <TodoList
          todos={mockTodos}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
        />
      </ChakraProvider>
    );
  };

  it('할 일 목록이 정상적으로 렌더링된다', () => {
    renderComponent();

    expect(screen.getByText('테스트 할 일 1')).toBeInTheDocument();
    expect(screen.getByText('테스트 할 일 2')).toBeInTheDocument();
  });

  it('체크박스 상태가 정상적으로 표시된다', () => {
    renderComponent();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).not.toBeChecked();
    expect(checkboxes[1]).toBeChecked();
  });

  it('체크박스 토글이 정상적으로 동작한다', () => {
    renderComponent();

    const checkbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(checkbox);

    expect(mockOnToggle).toHaveBeenCalledWith(mockTodos[0].id);
  });

  it('삭제 버튼이 정상적으로 동작한다', () => {
    renderComponent();
    const deleteButtons = screen.getAllByLabelText('Delete todo');
    fireEvent.click(deleteButtons[0]);
    expect(mockOnDelete).toHaveBeenCalledWith(mockTodos[0].id);
  });

  it('마감일이 있는 할 일은 배지로 표시된다', () => {
    renderComponent();
    const badge = screen.getByText((content) =>
      /2024년 3월 20일.*09:00/.test(content)
    );
    expect(badge).toBeInTheDocument();
  });

  it('마감일이 없는 할 일은 배지가 표시되지 않는다', () => {
    renderComponent();

    const todoItem = screen.getByText('테스트 할 일 2').closest('div');
    expect(todoItem).not.toHaveTextContent('마감일');
  });
});
