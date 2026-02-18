// Simple localStorage-backed auth + billing demo (not for production)
const STORAGE_KEY = 'wifi_billing_v1'

function readState(){
  const s = localStorage.getItem(STORAGE_KEY)
  return s ? JSON.parse(s) : {users:[], bills:[]}
}
function writeState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function seed(){
  const state = readState()
  if(state.users.length===0){
    // seed admin and a demo user
    state.users.push({id:1,username:'admin',password:btoa('admin123'),role:'admin',email:'admin@example.com'})
    state.users.push({id:2,username:'jane',password:btoa('password'),role:'user',email:'jane@example.com'})
    // seed a bill for jane
    state.bills.push({id:1,userId:2,period:'2026-02',amount:45.00,paid:false,notes:'Monthly package'})
    writeState(state)
  }
}

function hash(p){
  return btoa(p) // simple placeholder
}

function findUser(username){
  const s = readState()
  return s.users.find(u=>u.username===username)
}

function register({username,password,email,role='user'}){
  const s = readState()
  if(s.users.some(u=>u.username===username)) throw new Error('Username taken')
  const id = s.users.length?Math.max(...s.users.map(u=>u.id))+1:1
  const user = {id,username,password:hash(password),email,role}
  s.users.push(user)
  writeState(s)
  return user
}

function login({username,password}){
  const s = readState()
  const user = s.users.find(u=>u.username===username && u.password===hash(password))
  if(!user) throw new Error('Invalid credentials')
  // create session in localStorage
  localStorage.setItem('wifi_session', JSON.stringify({userId:user.id,username:user.username,role:user.role}))
  return user
}
function logout(){ localStorage.removeItem('wifi_session') }
function getSession(){ const s=localStorage.getItem('wifi_session'); return s?JSON.parse(s):null }

// Billing
function createBill({userId,period,amount,notes}){
  const s = readState()
  const id = s.bills.length?Math.max(...s.bills.map(b=>b.id))+1:1
  const bill = {id,userId,period,amount:parseFloat(amount),paid:false,notes}
  s.bills.push(bill)
  writeState(s)
  return bill
}
function getBillsForUser(userId){ const s = readState(); return s.bills.filter(b=>b.userId===userId) }
function getAllBills(){ return readState().bills }
function setBillPaid(id,paid=true){ const s=readState(); const b = s.bills.find(x=>x.id===id); if(b){b.paid=!!paid; writeState(s)} }
function deleteBill(id){ const s=readState(); s.bills = s.bills.filter(b=>b.id!==id); writeState(s) }

// utility
function fmtMoney(n){ return '$'+Number(n).toFixed(2) }

// expose
window.WifiBilling = {seed,register,login,logout,getSession,findUser,createBill,getBillsForUser,getAllBills,setBillPaid,deleteBill,fmtMoney}

// seed on load
seed()