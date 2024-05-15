import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  TableContainer,
  Button,
  Box,
  Stack,
} from "@mui/material";

import { onAuthStateChanged, getAuth } from 'firebase/auth';
import { selectUserData } from '../api/firebase';
import { useNavigate } from 'react-router-dom';
import WayModal from '../components/WayModal';
import AdminCategoryBar from '../components/AdminCategoryBar';

const AdminOrderHistoryList = () => {
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const auth = getAuth();
  const [sortBy, setSortBy] = useState('orderId');
  const [openModal, setOpenModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  const handleOpenModal = (orderId) => {
    setSelectedOrderId(orderId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserEmail(user.email);
      } else {
        setCurrentUserEmail(null);
      }
    });
  }, [auth]);

  useEffect(() => {
    if (currentUserEmail) {
      const fetchOrderHistory = async () => {
        try {
          const response = await axios.post('/ft/order/admin/historyList', { email: currentUserEmail });
          setOrders(response.data);
        } catch (error) {
          console.error('주문 내역을 불러오는데 실패했습니다:', error);
          setOrders([]);
        }
      };
      fetchOrderHistory();
    }
  }, [currentUserEmail]);

  const getGroupedOrders = () => {
    return orders.reduce((acc, order) => {
      if (!acc[order.oid]) {
        acc[order.oid] = [];
      }
      acc[order.oid].push(order);
      return acc;
    }, {});
  };

  const sortedOrders = () => {
    if (sortBy === 'orderId') {
      return Object.entries(getGroupedOrders())
        .sort(([orderIdA, orderListA], [orderIdB, orderListB]) => orderIdB - orderIdA)
        .map(([orderId, orderList]) => ({
          orderId,
          orderList,
          totalPrice: orderList.reduce((total, item) => total + item.price, 0),
        }));
    } else if (sortBy === 'status') {
      return Object.entries(getGroupedOrders())
        .sort(([orderIdA, orderListA], [orderIdB, orderListB]) => {
          // If status is not present, assign a default value to ensure it doesn't cause an error
          const statusA = (orderListA[0]?.status || '').toLowerCase(); 
          const statusB = (orderListB[0]?.status || '').toLowerCase();
          if (statusA > statusB) {
            return -1;
          }
          if (statusA < statusB) {
            return 1;
          }
          return 0;
        })
        .map(([orderId, orderList]) => ({
          orderId,
          orderList,
          totalPrice: orderList.reduce((total, item) => total + item.price, 0),
        }));
    }
  };
  
  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const sortOrdersByStatus = () => {
    navigate("/admin/order/list2");
  };

  const DeliveryTracker = (t_invoice) => {
    const carrier_id = 'kr.cjlogistics';
    const width = 400;
    const height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    const specs = `width=${width}, height=${height}, left=${left}, top=${top}`;
    window.open(`https://tracker.delivery/#/${carrier_id}/${t_invoice}`, "_blank", specs);
  };

  const handleDelete = async (orderId) => {
    const confirmDelete = window.confirm("정말로 주문을 취소하시겠습니까?");
    if (!confirmDelete) return;

    try {
      await axios.post('/ft/order/orderDelete', { oid: orderId });
      console.log('주문 삭제 완료');
    } catch (error) {
      console.error('주문 삭제 실패:', error);
    }
  };

  return (
    <Container fixed sx={{ mt: 5, mb: 5 }}>
      <AdminCategoryBar/>
      <div className="bottom-panel" style={{ width: '100%' }}>
        <div className="sort-options" style={{ width: '100%' }}>
          {/* 정렬 옵션 선택 */}
          <select value={sortBy} onChange={handleSortChange} style={{ width: 150 }}>
            <option value="orderId">주문 번호별 정렬</option>
            <option value="status">배송 상태별 정렬</option>
          </select>
        </div>
      </div>

      <hr />

      {sortedOrders().map(({ orderId, orderList, totalPrice }) => (
        <Box key={orderId} sx={{ mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">
              주문 번호: {orderId}
            </Typography>

            <Typography variant="body2">
              주문자: {orderList[0].email}
            </Typography>

            <Typography variant="body2">
              주문날짜: {orderList[0].regDate.substring(0, 10)}
            </Typography>

            <Typography variant="body2">
              총 가격: {totalPrice.toLocaleString()}원
            </Typography>

            <Typography variant="body2" onClick={() => DeliveryTracker(orderList[0].way)} style={{ cursor: 'pointer' }}>
              배송상태: {orderList[0].status}
            </Typography>

            <WayModal
              open={openModal && selectedOrderId === orderId}
              onClose={handleCloseModal}
              order={orderList[0]}
            />

            <Typography variant="body2">
              {orderList.some(order => order.way) ? (
                <>송장 번호: {orderList[0].way}</>
              ) : (
                <Button size="small" variant="contained" onClick={() => handleOpenModal(orderId)}>
                  송장 입력
                </Button>
              )}
            </Typography>

            <Typography>
              {orderList[0].status !== '주문완료' ? (
                <Button size="small" variant="contained" color="error" onClick={() => handleDelete(orderId)}>
                  주문취소
                </Button>
              ) : (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Button size="small" variant="contained" color="error" onClick={() => handleDelete(orderId)}>
                    주문취소
                  </Button>
                </>
              )}
            </Typography>
          </Stack>

          {/* Order details */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>상품 이미지</TableCell>
                  <TableCell>상품명</TableCell>
                  <TableCell align="center">개수</TableCell>
                  <TableCell align="center">가격</TableCell>
                  <TableCell align="center">주문 취소 여부</TableCell> {/* Aligning text to center */}
                </TableRow>
              </TableHead>

              <TableBody>
              {orderList.map((order, index) => (
                <TableRow key={index}>
                  <TableCell style={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                    <img
                      src={order.img1}
                      alt={order.name}
                      style={{ width: 50, height: 50, cursor: 'pointer', textAlign: 'center' }}
                      onClick={() => { navigate(`/item/detail/${order.iid}`) }}
                    />
                  </TableCell>

                  <TableCell style={{ cursor: 'pointer', borderRight: '1px solid rgba(224, 224, 224, 1)' }} onClick={() => { navigate(`/item/detail/${order.iid}`) }}>
                    {order.name.length > 10 ? order.name.substring(0, 10) + '...' : order.name}
                    <br />
                    ({order.option})
                  </TableCell>

                  <TableCell align="center" style={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                    {order.count}
                  </TableCell>

                  <TableCell align="center" style={{ borderRight: '1px solid rgba(224, 224, 224, 1)' }}>
                    {order.price.toLocaleString()}원
                  </TableCell>

                  <TableCell align="center" style={{ color: 'red' }}>
                    <Typography variant='h4'>{order.isDeleted}</Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>

            </Table>
          </TableContainer>

          <Divider />
        </Box>
      ))}

      {sortedOrders().length === 0 && (
        <Typography variant="h6" align="center">
          주문 내역이 없습니다.
        </Typography>
      )}
    </Container>
  );
};

export default AdminOrderHistoryList;
