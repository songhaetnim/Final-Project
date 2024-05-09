import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Toolbar } from '@mui/material'; // MUI에서 제공하는 Button 및 Toolbar 컴포넌트를 import

export default function AdminCategoryBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  const handleItemClick = (path) => {
    navigate(path);
    setActiveTab(path);
  };

  const buttonStyle = {
    backgroundColor: '#ffffff',
    color: 'black',
    border: 'none',
    padding: '0', 
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    width: '150px',
    height: '63px',
    boxShadow: 'none', 
    borderRadius : 0,
    margin: 0,
  };

  return (
    <Toolbar
      style={{
        backgroundColor: 'white',
        padding: '0', // 수정된 부분
        borderBottom: '2px solid red',
        justifyContent: 'center',
      }}
    >
      <Button
        onClick={() => handleItemClick('/admin/itemlist')}
        variant="contained"
        style={{
          ...buttonStyle,
          backgroundColor: activeTab === '/admin/itemlist' ? '#ff3333' : '#ffffff',
          color: activeTab === '/admin/itemlist' ? '#ffffff' : 'black',
        }}
      >
        아이템 정보
      </Button>
      <Button
        onClick={() => handleItemClick('/admin/QnAlist')}
        variant="contained"
        style={{
          ...buttonStyle,
          backgroundColor: activeTab === '/admin/QnAlist' ? '#ff3333' : '#ffffff',
          color: activeTab === '/admin/QnAlist' ? '#ffffff' : 'black',
        }}
      >
        문의
      </Button>
      <Button
        onClick={() => handleItemClick('/admin/order/list')}
        variant="contained"
        style={{
          ...buttonStyle,
          backgroundColor: activeTab === '/admin/order/list' ? '#ff3333' : '#ffffff',
          color: activeTab === '/admin/order/list' ? '#ffffff' : 'black',
        }}
      >
        주문
      </Button>
      <Button
        onClick={() => handleItemClick('/admin/sales')}
        variant="contained"
        style={{
          ...buttonStyle,
          backgroundColor: activeTab === '/admin/sales' ? '#ff3333' : '#ffffff',
          color: activeTab === '/admin/sales' ? '#ffffff' : 'black',
        }}
      >
        판매율
      </Button>
    </Toolbar>
  );
}