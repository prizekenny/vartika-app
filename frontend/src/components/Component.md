# Vartika UI Component Handbook

### ✅ 目录

- [Button 系列](#button)
- [SearchInput](#searchinput)
- [FilterBar](#filterbar)
- [Pagination](#pagination)
- [StatusBadge](#statusbadge)
- [DataTable](#datatable)
- [EmptyState](#emptystate)
- [LoadingIndicator](#loadingindicator)
- [Modal](#modal)
- [ConfirmDialog](#confirmdialog)
- [CreateDialog](#createdialog)

---

### Button

```jsx
<Button text="Click Me" onClick={...} />
<Button variant="primary" />
<Button variant="secondary" />
<Button variant="danger" />
```

---

### SearchInput

```jsx
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Search..."
/>
```

---

### FilterBar

```jsx
<FilterBar
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  statusValue={statusFilter}
  onStatusChange={setStatusFilter}
  dateValue={dateFilter}
  onDateChange={setDateFilter}
  statusOptions={["Planned", "In Progress", "Completed"]}
/>
```

---

### Pagination

```jsx
<Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
```

---

### StatusBadge

```jsx
<StatusBadge status="Completed" />
<StatusBadge status="In Progress" />
```

---

### DataTable

```jsx
<DataTable
  columns={[
    { key: "title", label: "Title" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]}
  data={data}
  onRowClick={(row) => console.log(row)}
/>
```

---

### EmptyState

```jsx
<EmptyState message="No assignments found." />
```

---

### LoadingIndicator

```jsx
<LoadingIndicator text="Loading data..." />
```

---

### Modal

```jsx
<Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Modal Title">
  Modal Content
</Modal>
```

---

### ConfirmDialog

```jsx
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setOpen(false)}
  onConfirm={() => console.log("confirmed")}
  title="Delete?"
  description="Are you sure to delete?"
/>
```

---

### CreateDialog

```jsx
<CreateDialog
  isOpen={isOpen}
  onClose={() => setOpen(false)}
  title="Create Assignment"
  fields={[
    { name: "title", label: "Title" },
    { name: "assignee", label: "Assignee" },
    { name: "dueDate", label: "Due Date", type: "date" },
  ]}
  onSubmit={(data) => console.log(data)}
/>
```

# Vartika UI Component Handbook

### ✅ 目录

- [Button 系列](#button)
- [SearchInput](#searchinput)
- [FilterBar](#filterbar)
- [Pagination](#pagination)
- [StatusBadge](#statusbadge)
- [DataTable](#datatable)
- [EmptyState](#emptystate)
- [LoadingIndicator](#loadingindicator)
- [Modal](#modal)
- [ConfirmDialog](#confirmdialog)
- [CreateDialog](#createdialog)

---

### Button

```jsx
<Button text="Click Me" onClick={...} />
<Button variant="primary" />
<Button variant="secondary" />
<Button variant="danger" />
```

---

### SearchInput

```jsx
<SearchInput
  value={searchTerm}
  onChange={setSearchTerm}
  placeholder="Search..."
/>
```

---

### FilterBar

```jsx
<FilterBar
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  statusValue={statusFilter}
  onStatusChange={setStatusFilter}
  dateValue={dateFilter}
  onDateChange={setDateFilter}
  statusOptions={["Planned", "In Progress", "Completed"]}
/>
```

---

### Pagination

```jsx
<Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
```

---

### StatusBadge

```jsx
<StatusBadge status="Completed" />
<StatusBadge status="In Progress" />
```

---

### DataTable

```jsx
<DataTable
  columns={[
    { key: "title", label: "Title" },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ]}
  data={data}
  onRowClick={(row) => console.log(row)}
/>
```

---

### EmptyState

```jsx
<EmptyState message="No assignments found." />
```

---

### LoadingIndicator

```jsx
<LoadingIndicator text="Loading data..." />
```

---

### Modal

```jsx
<Modal isOpen={isOpen} onClose={() => setOpen(false)} title="Modal Title">
  Modal Content
</Modal>
```

---

### ConfirmDialog

```jsx
<ConfirmDialog
  isOpen={isOpen}
  onClose={() => setOpen(false)}
  onConfirm={() => console.log("confirmed")}
  title="Delete?"
  description="Are you sure to delete?"
/>
```

---

### CreateDialog

```jsx
<CreateDialog
  isOpen={isOpen}
  onClose={() => setOpen(false)}
  title="Create Assignment"
  fields={[
    { name: "title", label: "Title" },
    { name: "assignee", label: "Assignee" },
    { name: "dueDate", label: "Due Date", type: "date" },
  ]}
  onSubmit={(data) => console.log(data)}
/>
```
