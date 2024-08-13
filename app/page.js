'use client'

import { Box, Stack, Typography, Button, Modal, TextField, IconButton, InputAdornment } from '@mui/material'
import { getFirestore, collection, doc, getDocs, query, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import { app } from '@/firebase'
import SearchIcon from '@mui/icons-material/Search'
import DeleteIcon from '@mui/icons-material/Delete'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#fff',
  borderRadius: 8,
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  width: '100vw',
  minHeight: '100vh',
  background: 'linear-gradient(to right, #f0f4f8, #d0e1f9)',
}

const sectionStyle = {
  width: '800px',
  border: '1px solid #ddd',
  padding: 2,
  borderRadius: 8,
  bgcolor: '#fff',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
}

const buttonStyle = {
  borderRadius: 8,
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    backgroundColor: '#0056b3',
    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.2)',
  },
}

const pantryItemStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  bgcolor: '#f9f9f9',
  padding: 2,
  borderRadius: 8,
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}

export default function Home() {
  const [pantry, setPantry] = useState([])
  const [openAdd, setOpenAdd] = useState(false)
  const [openDelete, setOpenDelete] = useState(false)
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [itemToDelete, setItemToDelete] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [addItemError, setAddItemError] = useState('') // State for add item errors
  const [quantityError, setQuantityError] = useState('') // State for quantity errors
  const [removeItemError, setRemoveItemError] = useState('') // State for remove item errors

  const firestore = getFirestore(app)

  const handleOpenAdd = () => setOpenAdd(true)
  const handleCloseAdd = () => {
    setItemName('') // Reset item name
    setQuantity(1) // Reset quantity
    setAddItemError('') // Clear item name error
    setQuantityError('') // Clear quantity error
    setOpenAdd(false)
  }

  const handleOpenDelete = (item) => {
    setItemToDelete(item)
    setQuantity(1)
    setErrorMessage('')
    setRemoveItemError('') // Clear remove item error
    setOpenDelete(true)
  }
  const handleCloseDelete = () => {
    setQuantity(1) // Reset quantity when closing delete modal
    setOpenDelete(false)
  }

  const updatePantry = async () => {
    const itemsCollection = collection(firestore, 'pantry')
    const q = query(itemsCollection)
    const docs = await getDocs(q)
    const pantryList = docs.docs.map(doc => ({
      id: doc.id,
      quantity: doc.data().quantity
    }))
    setPantry(pantryList)
  }

  useEffect(() => {
    updatePantry()
  }, [])

  const addItem = async (item, quantity) => {
    if (item.trim() === '') {
      setAddItemError('Item name cannot be empty.')
      return
    }
    
    if (quantity <= 0) {
      setQuantityError('Quantity must be greater than 0.')
      return
    }
    
    const itemLowerCase = item.toLowerCase() // Convert item name to lowercase
    const docRef = doc(collection(firestore, 'pantry'), itemLowerCase)
    const docSnapshot = await getDoc(docRef)
    
    if (docSnapshot.exists()) {
      // Item exists, update its quantity
      const existingQuantity = docSnapshot.data().quantity
      const newQuantity = existingQuantity + quantity
      await setDoc(docRef, { quantity: newQuantity })
    } else {
      // Item does not exist, create new item
      await setDoc(docRef, { quantity })
    }
    
    await updatePantry()
    setItemName('') // Reset item name
    setQuantity(1) // Reset quantity after adding item
    handleCloseAdd()
  }

  const removeItem = async (item, quantity) => {
    if (quantity <= 0) {
      setRemoveItemError('Quantity must be greater than 0.')
      return
    }
    
    const itemLowerCase = item.toLowerCase() // Convert item name to lowercase
    const docRef = doc(collection(firestore, 'pantry'), itemLowerCase)
    const docSnapshot = await getDoc(docRef)
    if (docSnapshot.exists()) {
      const existingQuantity = docSnapshot.data().quantity
      if (quantity > existingQuantity) {
        setErrorMessage(`You cannot remove more than ${existingQuantity} items.`)
      } else {
        const newQuantity = existingQuantity - quantity
        if (newQuantity <= 0) {
          await deleteDoc(docRef)
        } else {
          await setDoc(docRef, { quantity: newQuantity })
        }
        await updatePantry()
        handleCloseDelete()
      }
    }
  }

  const filteredPantry = pantry.filter((item) =>
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Box sx={containerStyle}>
      <Typography variant={'h3'} color={'#333'} textAlign={'center'} mb={4}>
        Pantry Manager
      </Typography>
      <Box width="800px" mb={4}>
        <TextField
          fullWidth
          placeholder="Search items..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Button variant="contained" onClick={handleOpenAdd} sx={buttonStyle}>
        Add Item
      </Button>

      {/* Add Item Modal */}
      <Modal
        open={openAdd}
        onClose={handleCloseAdd}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              error={!!addItemError}
              helperText={addItemError}
            />
            <TextField
              label="Quantity"
              variant="outlined"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              error={!!quantityError}
              helperText={quantityError}
            />
            <Button
              variant="contained"
              onClick={() => addItem(itemName, quantity)}
              sx={buttonStyle}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      {/* Pantry Items List */}
      <Box sx={sectionStyle} mt={4}>
        <Typography variant={'h5'} color={'#333'} textAlign={'center'} mb={2}>
          Pantry Items
        </Typography>
        <Stack spacing={2} maxHeight="400px" overflow={'auto'}>
          {filteredPantry.map((i) => (
            <Box
              key={i.id}
              sx={pantryItemStyle}
            >
              <Typography variant={'h6'} color={'#333'}>
                {i.id.charAt(0).toUpperCase() + i.id.slice(1)}
              </Typography>
              <Typography variant={'body1'} color={'#333'}>
                Quantity: {i.quantity}
              </Typography>
              <IconButton
                color="secondary"
                onClick={() => handleOpenDelete(i.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Delete Item Modal */}
      <Modal
        open={openDelete}
        onClose={handleCloseDelete}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Remove Item
          </Typography>
          <Stack width="100%" direction={'column'} spacing={2}>
            <TextField
              label="Quantity to Remove"
              variant="outlined"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              fullWidth
              error={!!removeItemError}
              helperText={removeItemError}
            />
            {errorMessage && (
              <Typography color="error" textAlign={'center'}>
                {errorMessage}
              </Typography>
            )}
            <Button
              variant="contained"
              color="secondary"
              onClick={() => removeItem(itemToDelete, quantity)}
              sx={buttonStyle}
            >
              Remove
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}