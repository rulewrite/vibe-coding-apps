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
  const mockOnReorder = jest.fn();
  const mockOnUpdate = jest.fn();
  const mockOnDeleteAll = jest.fn();

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
          onReorder={mockOnReorder}
          onUpdate={mockOnUpdate}
          onDeleteAll={mockOnDeleteAll}
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

  it('드래그 앤 드롭이 정상적으로 동작한다', () => {
    renderComponent();
    const todoItems = screen.getAllByRole('button', { name: /drag handle/i });
    const sourceItem = todoItems[0];
    const destinationItem = todoItems[1];

    // 드래그 시작
    fireEvent.mouseDown(sourceItem);
    fireEvent.dragStart(sourceItem);

    // 드래그 중
    fireEvent.dragOver(destinationItem);

    // 드래그 종료
    fireEvent.drop(destinationItem);
    fireEvent.dragEnd(sourceItem, {
      source: { index: 0 },
      destination: { index: 1 },
    });

    expect(mockOnReorder).toHaveBeenCalledWith(0, 1);
  });

  it('전체 삭제 버튼이 정상적으로 동작한다', () => {
    renderComponent();

    // 전체 삭제 버튼 클릭
    const deleteAllButton = screen.getByText('전체 삭제');
    fireEvent.click(deleteAllButton);

    // 확인 모달이 표시되는지 확인
    expect(screen.getByText('전체 삭제 확인')).toBeInTheDocument();
    expect(
      screen.getByText('정말로 모든 할 일을 삭제하시겠습니까?')
    ).toBeInTheDocument();

    // 삭제 버튼 클릭
    const confirmButton = screen.getByText('삭제');
    fireEvent.click(confirmButton);

    // onDeleteAll이 호출되었는지 확인
    expect(mockOnDeleteAll).toHaveBeenCalled();
  });

  it('전체 삭제 취소가 정상적으로 동작한다', () => {
    renderComponent();

    // 전체 삭제 버튼 클릭
    const deleteAllButton = screen.getByText('전체 삭제');
    fireEvent.click(deleteAllButton);

    // 취소 버튼 클릭
    const cancelButton = screen.getByText('취소');
    fireEvent.click(cancelButton);

    // onDeleteAll이 호출되지 않았는지 확인
    expect(mockOnDeleteAll).not.toHaveBeenCalled();
  });

  it('할 일이 없을 때는 전체 삭제 버튼이 표시되지 않는다', () => {
    render(
      <ChakraProvider>
        <TodoList
          todos={[]}
          onToggle={mockOnToggle}
          onDelete={mockOnDelete}
          onReorder={mockOnReorder}
          onUpdate={mockOnUpdate}
          onDeleteAll={mockOnDeleteAll}
        />
      </ChakraProvider>
    );

    expect(screen.queryByText('전체 삭제')).not.toBeInTheDocument();
  });
});
