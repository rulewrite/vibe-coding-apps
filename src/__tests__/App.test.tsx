import { ChakraProvider } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '../App';

describe('App 컴포넌트', () => {
  const renderComponent = () => {
    return render(
      <ChakraProvider>
        <App />
      </ChakraProvider>
    );
  };

  beforeEach(() => {
    localStorage.clear();
  });

  it('기본 렌더링이 정상적으로 동작한다', () => {
    renderComponent();

    expect(screen.getByText('TODO 앱')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('할 일을 입력하세요...')
    ).toBeInTheDocument();
  });

  it('할 일 추가가 정상적으로 동작한다', () => {
    renderComponent();

    const input = screen.getByPlaceholderText('할 일을 입력하세요...');
    const addButton = screen.getByRole('button', { name: '추가' });

    fireEvent.change(input, { target: { value: '새로운 할 일' } });
    fireEvent.click(addButton);

    expect(screen.getByText('새로운 할 일')).toBeInTheDocument();
  });

  it('할 일 완료 상태 토글이 정상적으로 동작한다', () => {
    renderComponent();

    // 할 일 추가
    const input = screen.getByPlaceholderText('할 일을 입력하세요...');
    const addButton = screen.getByRole('button', { name: '추가' });
    fireEvent.change(input, { target: { value: '토글 테스트' } });
    fireEvent.click(addButton);

    // 체크박스 토글
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(checkbox).toBeChecked();
  });

  it('할 일 삭제가 정상적으로 동작한다', () => {
    renderComponent();

    // 할 일 추가
    const input = screen.getByPlaceholderText('할 일을 입력하세요...');
    const addButton = screen.getByRole('button', { name: '추가' });
    fireEvent.change(input, { target: { value: '삭제 테스트' } });
    fireEvent.click(addButton);

    // 삭제 버튼 클릭 (aria-label 사용)
    const deleteButton = screen.getByLabelText('Delete todo');
    fireEvent.click(deleteButton);

    expect(screen.queryByText('삭제 테스트')).not.toBeInTheDocument();
  });

  it('로컬 스토리지에 할 일이 저장된다', () => {
    renderComponent();

    // 할 일 추가
    const input = screen.getByPlaceholderText('할 일을 입력하세요...');
    const addButton = screen.getByRole('button', { name: '추가' });
    fireEvent.change(input, { target: { value: '스토리지 테스트' } });
    fireEvent.click(addButton);

    // 컴포넌트 리렌더링
    renderComponent();

    expect(screen.getAllByText('스토리지 테스트').length).toBeGreaterThan(0);
  });
});
