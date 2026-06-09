const { useState, useEffect } = React;

// --- API Configuration ---
const API_BASE = '/api';

const api = {
    getBooks: () => fetch(`${API_BASE}/books`).then(r => r.json()),
    addBook: (book) => fetch(`${API_BASE}/books`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) }).then(r => r.json()),
    updateBook: (id, book) => fetch(`${API_BASE}/books/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(book) }).then(r => r.json()),
    deleteBook: (id) => fetch(`${API_BASE}/books/${id}`, { method: 'DELETE' }),
    
    getMembers: () => fetch(`${API_BASE}/members`).then(r => r.json()),
    addMember: (member) => fetch(`${API_BASE}/members`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(member) }).then(r => r.json()),
    updateMember: (id, member) => fetch(`${API_BASE}/members/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(member) }).then(r => r.json()),
    deleteMember: (id) => fetch(`${API_BASE}/members/${id}`, { method: 'DELETE' }),

    getBorrows: () => fetch(`${API_BASE}/borrow`).then(r => r.json()),
    checkoutBook: (data) => fetch(`${API_BASE}/borrow/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json()),
    returnBook: (id) => fetch(`${API_BASE}/borrow/return/${id}`, { method: 'POST' }).then(r => r.json())
};

// --- Main Application Component ---
function App() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [stats, setStats] = useState({ books: 0, members: 0, activeBorrows: 0 });

    const fetchStats = async () => {
        try {
            const [books, members, borrows] = await Promise.all([api.getBooks(), api.getMembers(), api.getBorrows()]);
            setStats({
                books: books.length,
                members: members.length,
                activeBorrows: borrows.filter(b => b.returnDate === null).length
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [currentView]); // Refresh stats when view changes

    return (
        <div className="app-container">
            {/* Sidebar Navigation */}
            <div className="sidebar">
                <h2><i className="fa-solid fa-book-open"></i> Library</h2>
                <ul className="nav-links">
                    <li className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={() => setCurrentView('dashboard')}>
                        <i className="fa-solid fa-chart-pie"></i> <span>Dashboard</span>
                    </li>
                    <li className={`nav-item ${currentView === 'books' ? 'active' : ''}`} onClick={() => setCurrentView('books')}>
                        <i className="fa-solid fa-book"></i> <span>Books</span>
                    </li>
                    <li className={`nav-item ${currentView === 'members' ? 'active' : ''}`} onClick={() => setCurrentView('members')}>
                        <i className="fa-solid fa-users"></i> <span>Members</span>
                    </li>
                    <li className={`nav-item ${currentView === 'borrow' ? 'active' : ''}`} onClick={() => setCurrentView('borrow')}>
                        <i className="fa-solid fa-hand-holding-hand"></i> <span>Borrowing</span>
                    </li>
                </ul>
            </div>

            {/* Main Content Area */}
            <div className="main-content glass" style={{ margin: '1rem', borderRadius: '16px', overflowY: 'auto' }}>
                <div className="header">
                    <h1 style={{textTransform: 'capitalize'}}>{currentView}</h1>
                </div>

                {currentView === 'dashboard' && <Dashboard stats={stats} />}
                {currentView === 'books' && <BooksView />}
                {currentView === 'members' && <MembersView />}
                {currentView === 'borrow' && <BorrowView />}
            </div>
        </div>
    );
}

// --- Views ---

function Dashboard({ stats }) {
    return (
        <div>
            <div className="stats-container">
                <div className="stat-card glass" style={{borderLeft: '4px solid var(--primary-color)'}}>
                    <i className="fa-solid fa-book stat-icon"></i>
                    <div className="stat-value">{stats.books}</div>
                    <div className="stat-label">Total Books</div>
                </div>
                <div className="stat-card glass" style={{borderLeft: '4px solid var(--secondary-color)'}}>
                    <i className="fa-solid fa-users stat-icon" style={{color: 'var(--secondary-color)'}}></i>
                    <div className="stat-value">{stats.members}</div>
                    <div className="stat-label">Total Members</div>
                </div>
                <div className="stat-card glass" style={{borderLeft: '4px solid var(--danger-color)'}}>
                    <i className="fa-solid fa-hand-holding-hand stat-icon" style={{color: 'var(--danger-color)'}}></i>
                    <div className="stat-value">{stats.activeBorrows}</div>
                    <div className="stat-label">Active Borrows</div>
                </div>
            </div>
            
            <div className="glass" style={{padding: '2rem', borderRadius: '16px'}}>
                <h3 style={{marginBottom: '1rem', color: 'var(--primary-color)'}}>Welcome to the Modern Library System</h3>
                <p style={{color: '#4b5563', lineHeight: '1.6'}}>Manage your books, members, and borrowing records seamlessly. Use the sidebar to navigate through the different modules. The system uses an in-memory database to instantly reflect your changes.</p>
            </div>
        </div>
    );
}

function BooksView() {
    const [books, setBooks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingBook, setEditingBook] = useState(null);

    const loadBooks = () => api.getBooks().then(setBooks);
    useEffect(() => { loadBooks(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const bookData = {
            title: formData.get('title'),
            author: formData.get('author'),
            isbn: formData.get('isbn'),
            available: formData.get('available') === 'true'
        };

        if (editingBook) {
            await api.updateBook(editingBook.id, bookData);
        } else {
            await api.addBook(bookData);
        }
        setShowModal(false);
        setEditingBook(null);
        loadBooks();
    };

    const handleDelete = async (id) => {
        if(confirm("Are you sure you want to delete this book?")) {
            await api.deleteBook(id);
            loadBooks();
        }
    };

    const openEdit = (book) => {
        setEditingBook(book);
        setShowModal(true);
    };

    return (
        <div>
            <div className="flex-between">
                <h3>Book Inventory</h3>
                <button className="btn btn-primary" onClick={() => { setEditingBook(null); setShowModal(true); }}>
                    <i className="fa-solid fa-plus"></i> Add Book
                </button>
            </div>
            
            <div className="table-container glass">
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>ISBN</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.length === 0 ? <tr><td colSpan="5" style={{textAlign: 'center'}}>No books found.</td></tr> : null}
                        {books.map(b => (
                            <tr key={b.id}>
                                <td><strong>{b.title}</strong></td>
                                <td>{b.author}</td>
                                <td>{b.isbn}</td>
                                <td>
                                    <span className={`status-badge ${b.available ? 'status-available' : 'status-borrowed'}`}>
                                        {b.available ? 'Available' : 'Borrowed'}
                                    </span>
                                </td>
                                <td className="action-cell">
                                    <button className="btn" style={{padding: '0.4rem', background: '#e5e7eb', color: '#374151'}} onClick={() => openEdit(b)}>
                                        <i className="fa-solid fa-pen"></i>
                                    </button>
                                    <button className="btn btn-danger" style={{padding: '0.4rem'}} onClick={() => handleDelete(b.id)}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Book Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingBook ? 'Edit Book' : 'Add New Book'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><i className="fa-solid fa-times"></i></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title</label>
                                <input name="title" required defaultValue={editingBook?.title || ''} />
                            </div>
                            <div className="form-group">
                                <label>Author</label>
                                <input name="author" required defaultValue={editingBook?.author || ''} />
                            </div>
                            <div className="form-group">
                                <label>ISBN</label>
                                <input name="isbn" required defaultValue={editingBook?.isbn || ''} />
                            </div>
                            <div className="form-group">
                                <label>Availability</label>
                                <select name="available" defaultValue={editingBook ? editingBook.available.toString() : 'true'}>
                                    <option value="true">Available</option>
                                    <option value="false">Borrowed</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
                                {editingBook ? 'Update Book' : 'Save Book'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function MembersView() {
    const [members, setMembers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingMember, setEditingMember] = useState(null);

    const loadMembers = () => api.getMembers().then(setMembers);
    useEffect(() => { loadMembers(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const memberData = {
            name: formData.get('name'),
            email: formData.get('email')
        };

        if (editingMember) {
            await api.updateMember(editingMember.id, memberData);
        } else {
            await api.addMember(memberData);
        }
        setShowModal(false);
        setEditingMember(null);
        loadMembers();
    };

    const handleDelete = async (id) => {
        if(confirm("Delete this member?")) {
            await api.deleteMember(id);
            loadMembers();
        }
    };

    return (
        <div>
            <div className="flex-between">
                <h3>Member Directory</h3>
                <button className="btn btn-primary" onClick={() => { setEditingMember(null); setShowModal(true); }}>
                    <i className="fa-solid fa-plus"></i> Add Member
                </button>
            </div>
            
            <div className="table-container glass">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.length === 0 ? <tr><td colSpan="3" style={{textAlign: 'center'}}>No members found.</td></tr> : null}
                        {members.map(m => (
                            <tr key={m.id}>
                                <td><strong>{m.name}</strong></td>
                                <td>{m.email}</td>
                                <td className="action-cell">
                                    <button className="btn" style={{padding: '0.4rem', background: '#e5e7eb'}} onClick={() => {setEditingMember(m); setShowModal(true);}}>
                                        <i className="fa-solid fa-pen"></i>
                                    </button>
                                    <button className="btn btn-danger" style={{padding: '0.4rem'}} onClick={() => handleDelete(m.id)}>
                                        <i className="fa-solid fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Member Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>{editingMember ? 'Edit Member' : 'Add New Member'}</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><i className="fa-solid fa-times"></i></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input name="name" required defaultValue={editingMember?.name || ''} />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" name="email" required defaultValue={editingMember?.email || ''} />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
                                {editingMember ? 'Update Member' : 'Save Member'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function BorrowView() {
    const [records, setRecords] = useState([]);
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [showModal, setShowModal] = useState(false);

    const loadData = () => {
        api.getBorrows().then(setRecords);
        api.getBooks().then(setBooks);
        api.getMembers().then(setMembers);
    };
    useEffect(() => { loadData(); }, []);

    const handleCheckout = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        try {
            await api.checkoutBook({ bookId: formData.get('bookId'), memberId: formData.get('memberId') });
            setShowModal(false);
            loadData();
        } catch(err) {
            alert("Checkout failed. Ensure book is available.");
        }
    };

    const handleReturn = async (id) => {
        if(confirm("Mark this book as returned?")) {
            await api.returnBook(id);
            loadData();
        }
    };

    return (
        <div>
            <div className="flex-between">
                <h3>Borrowing System</h3>
                <button className="btn btn-secondary" onClick={() => setShowModal(true)}>
                    <i className="fa-solid fa-handshake"></i> Issue Book
                </button>
            </div>
            
            <div className="table-container glass">
                <table>
                    <thead>
                        <tr>
                            <th>Book</th>
                            <th>Member</th>
                            <th>Issue Date</th>
                            <th>Return Date</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.length === 0 ? <tr><td colSpan="6" style={{textAlign: 'center'}}>No borrowing records.</td></tr> : null}
                        {records.map(r => (
                            <tr key={r.id}>
                                <td>{r.book.title}</td>
                                <td>{r.member.name}</td>
                                <td>{r.borrowDate}</td>
                                <td>{r.returnDate || '-'}</td>
                                <td>
                                    <span className={`status-badge ${r.returnDate ? 'status-available' : 'status-borrowed'}`}>
                                        {r.returnDate ? 'Returned' : 'Active'}
                                    </span>
                                </td>
                                <td>
                                    {!r.returnDate && (
                                        <button className="btn btn-primary" style={{padding: '0.4rem 0.8rem', fontSize: '0.8rem'}} onClick={() => handleReturn(r.id)}>
                                            Return
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

             {/* Checkout Modal */}
             {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Issue Book to Member</h3>
                            <button className="close-btn" onClick={() => setShowModal(false)}><i className="fa-solid fa-times"></i></button>
                        </div>
                        <form onSubmit={handleCheckout}>
                            <div className="form-group">
                                <label>Select Book</label>
                                <select name="bookId" required>
                                    <option value="">-- Choose Book --</option>
                                    {books.filter(b => b.available).map(b => (
                                        <option key={b.id} value={b.id}>{b.title} ({b.isbn})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Select Member</label>
                                <select name="memberId" required>
                                    <option value="">-- Choose Member --</option>
                                    {members.map(m => (
                                        <option key={m.id} value={m.id}>{m.name} ({m.email})</option>
                                    ))}
                                </select>
                            </div>
                            <button type="submit" className="btn btn-secondary" style={{width: '100%', marginTop: '1rem'}}>
                                Complete Checkout
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Render App
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
