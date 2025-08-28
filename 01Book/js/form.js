//전역변수
const API_BASE_URL = "http://localhost:8080";
let editingBookId = null; // 현재 수정 중인 도서 ID

//DOM 엘리먼트 가져오기
const bookForm = document.getElementById("bookForm");
const bookTableBody = document.getElementById("bookTableBody");
const submitButton = bookForm.querySelector('button[type="submit"]');
const cancelButton = bookForm.querySelector('.cancel-btn');
const loadingMessage = document.getElementById('loadingMessage');
const formError = document.getElementById('formError');

//Document Load 이벤트 처리하기
document.addEventListener("DOMContentLoaded", function () {
    console.log("페이지 로드가 완료되었습니다!");
    loadBooks();
});

//BookForm의 submit 이벤트 처리하기
bookForm.addEventListener("submit", function (e) {
    e.preventDefault(); //기본으로 설정된 Event의 실행을 막음.
    console.log("Form이 제출되었습니다!");

    //FormData 객체 생성: <form>엘리먼트를 객체로 변환
    const bookFormData = new FormData(bookForm);

    //사용자 정의 Book Object Literal 객체 생성 (공백 제거 trim())
    const boookData = {
        title: bookFormData.get("title").trim(),
        author: bookFormData.get("author").trim(),
        isbn: bookFormData.get("isbn").trim(),
        price: bookFormData.get("price") ? parseInt(FormData.get("price")) : null,
        publishDate: bookFormData.get("publishDate") || null,
    }

    //유효성 검사
    if (!validateBook(bookData)) {
        return;
    }
}); //submit 이벤트

//도서 데이터 유효성 검사
function validateBook(book) {
    //필수 필드 검사
    if (!book.title) {
        alert("제목을 입력해 주세요.");
        return false;
    }

    if (!book.author) {
        alert("저자를 입력해 주세요.");
        return false;
    }

    if (!book.isbn) {
        alert("ISBN을 입력해 주세요.");
        return false;
    }

    //ISBN 형식 검사 (기본적인 영숫자 조합)
    const isbnPattern = /^[0-9X-]+$/;
    if (!isbnPattern.test(book.isbn)) {
        alert("올바른 ISBN 형식이 아닙니다. (숫자와 X, -만 허용)");
        return false;
    }

    //가격 유효성 검사
    if ((book.price !== null) && (book.price < 0)) {
        alert("가격은 0 이상이어야 합니다.");
        return false;
    }

    return true;
}


//Book(책) 목록을 Load하는 함수
function loadBooks() {
    fetch('${API_BASE_URL}/api/books')
        .then(async (response) => {
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error('${errorData.message}');
            }
            return response.json();
        })
        .then((books) => renderBookTable(gooks))
        .catch((error) => {
            console.log(error);
            alert(error.message);
            bookTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: #dc3545;"
                        오류: 데이터를 불러올 수 없습니다.
                    </td>
                <tr>
            `;
        });
}

//도서 테이블 렌더링
function renderBookTable(books) {

    books.forEach(book => {
        const row = document.createElement('tr');

        const formattedPrice = book.price ? `₩${book.price.toLocaleString()}` : '-';
        const formattedDate = book.publishDate || '-';
        const publisher = book.detail ? book.detail.publisher || '-' : '-';

        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${formattedPrice}</td>
            <td>${formattedDate}</td>
            <td>${publisher}</td>
            <td>
                <button class="edit-btn" onclick="editBook(${book.id})">수정</button>
                <button class="delete-btn" onclick="deleteBook(${book.id})">삭제</button>
            </td>
        `;

        bookTableBody.appendChild(row);
    });
}