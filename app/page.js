'use client'

import { useState, useEffect } from 'react'
import { Box, Stack, Typography, Button, TextField, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, ThemeProvider, createTheme, CssBaseline, TablePagination, Fade, Select, MenuItem } from '@mui/material'
import { Add as AddIcon, AddCircle as AddCircleIcon, RemoveCircle as RemoveCircleIcon, Delete as DeleteIcon } from '@mui/icons-material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#e8f4ea',
      paper: '#ffffff',
    },
    text: {
      primary: '#000000',
    },
    primary: {
      main: '#357960', // Emerald green
    },
    secondary: {
      main: '#d32f2f',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
})

const categories = ['Fruits', 'Vegetables', 'Grains', 'Dairy', 'Meat']

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [category, setCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [deletingItem, setDeletingItem] = useState(null)

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item, qty, expDate, cat) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      await setDoc(docRef, { quantity: data.quantity + parseInt(qty), expirationDate: expDate, category: cat })
    } else {
      await setDoc(docRef, { quantity: parseInt(qty), expirationDate: expDate, category: cat })
    }
    await updateInventory()
  }

  const decreaseItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.quantity > 1) {
        await setDoc(docRef, { quantity: data.quantity - 1, expirationDate: data.expirationDate, category: data.category })
      } else {
        setDeletingItem(item)
        await deleteDoc(docRef)
        setDeletingItem(null)
      }
    }
    await updateInventory()
  }

  const handleDelete = async (item) => {
    setDeletingItem(item)
    await deleteDoc(doc(collection(firestore, 'inventory'), item))
    setDeletingItem(null)
    await updateInventory()
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (selectedCategory ? item.category === selectedCategory : true)
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ bgcolor: theme.palette.primary.main, p: 2 }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{ textAlign: 'center', color: '#ffffff', fontWeight: 'bold' }}
          >
            Pantry Mate
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, padding: 3, bgcolor: 'background.default' }}>
          <Stack direction="row" spacing={3} sx={{ width: '90%' }}>
            <Paper elevation={3} sx={{ p: 3, width: '30%' }}>
              <Typography variant="h5" gutterBottom>
                Add Pantry Item
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="Name"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <TextField
                  label="Quantity"
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
                <TextField
                  label="Expiration Date"
                  variant="outlined"
                  fullWidth
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                />
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  displayEmpty
                  fullWidth
                  variant="outlined"
                  sx={{ mb: 2 }}
                >
                  <MenuItem value="" disabled>Select Category</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    addItem(itemName, quantity, expirationDate, category)
                    setItemName('')
                    setQuantity('')
                    setExpirationDate('')
                    setCategory('')
                  }}
                >
                  Add Item
                </Button>
              </Stack>
            </Paper>
            <Paper elevation={3} sx={{ p: 3, width: '70%', maxHeight: '500px', overflowY: 'auto' }}>
              <Typography variant="h5" gutterBottom>
                Pantry Items
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <TextField
                  label="Search items"
                  variant="outlined"
                  fullWidth
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ flexGrow: 1 }}
                />
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  displayEmpty
                  variant="outlined"
                  sx={{ width: 150 }}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </Stack>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Quantity</strong></TableCell>
                      <TableCell><strong>Expiration</strong></TableCell>
                      <TableCell><strong>Category</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInventory.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(({ name, quantity, expirationDate, category }) => (
                      <Fade key={name} in={deletingItem !== name} timeout={500}>
                        <TableRow>
                          <TableCell>{name}</TableCell>
                          <TableCell>{quantity}</TableCell>
                          <TableCell>{expirationDate}</TableCell>
                          <TableCell>
                            <Box
                              sx={{
                                backgroundColor: getCategoryColor(category),
                                borderRadius: 1,
                                padding: '4px 8px',
                                display: 'inline-block',
                              }}
                            >
                              {category}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <IconButton color="primary" onClick={() => addItem(name, 1, expirationDate, category)}>
                              <AddCircleIcon />
                            </IconButton>
                            <IconButton color="secondary" onClick={() => decreaseItem(name)}>
                              <RemoveCircleIcon />
                            </IconButton>
                            <IconButton color="error" onClick={() => handleDelete(name)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      </Fade>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredInventory.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </Stack>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

const getCategoryColor = (category) => {
  switch (category) {
    case 'Fruits':
      return '#ffeb3b' // Yellow
    case 'Vegetables':
      return '#a5d6a7' // Light green
    case 'Grains':
      return '#fff176' // Light yellow
    case 'Dairy':
      return '#b3e5fc' // Light blue
    case 'Meat':
      return '#ffcdd2' // Light red
    default:
      return '#ffffff'
  }
}
