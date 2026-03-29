<template>
    <div class="container py-5">
      <div class="text-center mb-4">
        <h2 class="fw-bold text-primary">📦 ระบบจัดการสต็อกสินค้า</h2>
        <p class="text-muted">จัดการข้อมูลสินค้าแบบ Real-time ผ่าน n8n</p>
      </div>
  
      <div class="card shadow-lg border-0 rounded-4">
        <div class="card-body p-4">
          
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="mb-0 fw-bold">รายการสินค้าทั้งหมด</h5>
            <div class="d-flex gap-2">
              <button class="btn btn-success fw-bold shadow-sm" data-bs-toggle="modal" data-bs-target="#addProductModal">
                ➕ เพิ่มสินค้า
              </button>
              <button class="btn btn-outline-primary shadow-sm" @click="fetchData" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                🔄 รีเฟรช
              </button>
            </div>
          </div>
  
          <div class="table-responsive" v-if="!loading && products.length > 0">
            <table class="table table-hover align-middle">
              <thead class="table-primary text-center">
                <tr>
                  <th width="70">#</th>
                  <th>รหัสสินค้า</th>
                  <th>ชื่อสินค้า</th>
                  <th>จำนวน</th>
                  <th>ราคา/หน่วย</th>
                  <th>รวมมูลค่า</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in products" :key="item.id_product || index" class="text-center">
                  <td>{{ index + 1 }}</td>
                  <td><span class="badge bg-light text-dark border">{{ item.id_product }}</span></td>
                  <td class="text-start">{{ item.name }}</td>
                  <td>{{ item.qty?.toLocaleString() }}</td>
                  <td class="text-end fw-bold text-success">{{ item.price?.toLocaleString() }} บาท</td>
                  <td class="text-end bg-light fw-bold text-primary">{{ (item.price * item.qty)?.toLocaleString() }} บาท</td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2 text-muted">กำลังโหลดข้อมูล...</p>
          </div>
  
          <div v-else-if="!loading && products.length === 0" class="text-center py-5">
            <p class="text-muted fs-5">📭 ไม่พบข้อมูลสินค้า</p>
          </div>
        </div>
      </div>
  
      <div class="modal fade" id="addProductModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 rounded-4 shadow-lg">
            <div class="modal-header text-white rounded-top-4" 
                 style="background: linear-gradient(135deg, #0d6efd, #0dcaf0);">
              <h5 class="modal-title fw-bold">📋 เพิ่มสินค้าใหม่</h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" id="closeModalBtn"></button>
            </div>
  
            <form @submit.prevent="submitForm">
              <div class="modal-body p-4">
                <div class="mb-3">
                  <label class="form-label fw-bold">รหัสสินค้า *</label>
                  <input type="text" class="form-control shadow-sm" v-model="form.id_product" placeholder="เช่น P001" required>
                </div>
  
                <div class="mb-3">
                  <label class="form-label fw-bold">ชื่อสินค้า *</label>
                  <input type="text" class="form-control shadow-sm" v-model="form.name" placeholder="ระบุชื่อสินค้า" required>
                </div>
  
                <div class="row">
                  <div class="col-6 mb-3">
                    <label class="form-label fw-bold">จำนวน *</label>
                    <input type="number" class="form-control shadow-sm" v-model.number="form.qty" min="1" required>
                  </div>
                  <div class="col-6 mb-3">
                    <label class="form-label fw-bold">ราคา *</label>
                    <input type="number" class="form-control shadow-sm" v-model.number="form.price" min="0" required>
                  </div>
                </div>
              </div>
  
              <div class="modal-footer border-0">
                <button type="button" class="btn btn-light px-4" data-bs-dismiss="modal">ยกเลิก</button>
                <button type="submit" class="btn btn-primary px-4 fw-bold shadow-sm" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  
      <div class="modal fade" id="successModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-sm">
          <div class="modal-content border-0 rounded-4 shadow-lg text-center">
            <div class="modal-body p-5">
              <div class="mb-3">
                <span class="display-3 text-success">✅</span>
              </div>
              <h4 class="fw-bold">บันทึกสำเร็จ!</h4>
              <p class="text-muted">ข้อมูลถูกส่งเข้า n8n เรียบร้อยแล้ว</p>
              <button type="button" class="btn btn-success w-100 rounded-3 fw-bold py-2 mt-3 shadow-sm" data-bs-dismiss="modal">
                ตกลง
              </button>
            </div>
          </div>
        </div>
      </div>
  
    </div>
  </template>
  
  <script setup>
  /* global bootstrap */
  import { ref, reactive, onMounted } from 'vue'
  
  // --- State Management ---
  const products = ref([])
  const loading = ref(false)
  const submitting = ref(false)
  
  // ข้อมูลฟอร์ม
  const form = reactive({
    id_product: '',
    name: '',
    qty: 1,
    price: 0
  })
  
  // --- Functions ---
  
  // 1. ดึงข้อมูล (GET)
  const fetchData = async () => {
    loading.value = true
    try {
      const response = await fetch('http://localhost:5678/webhook/productja')
      if (!response.ok) throw new Error('Fetch Error')
      const data = await response.json()
      products.value = Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      loading.value = false
    }
  }
  
  // 2. ส่งข้อมูล (POST)
  const submitForm = async () => {
    submitting.value = true
    try {
      const response = await fetch('http://localhost:5678/webhook/Productpost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          tdate: new Date().toISOString().split('T')[0]
        })
      })
  
      if (response.ok) {
        // ปิด Modal เพิ่มสินค้า
        document.getElementById('closeModalBtn').click()
  
        // ล้างข้อมูลในฟอร์ม
        Object.assign(form, { id_product: '', name: '', qty: 1, price: 0 })
  
        // แสดง Success Modal
        const successModalElement = document.getElementById('successModal')
        const modalInstance = new bootstrap.Modal(successModalElement)
        modalInstance.show()
  
        // โหลดข้อมูลในตารางใหม่
        fetchData()
      } else {
        throw new Error('Save Error')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      alert('❌ บันทึกไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อกับ n8n')
    } finally {
      submitting.value = false
    }
  }
  
  onMounted(() => {
    fetchData()
  })
  </script>
  
  <style scoped>
  .card { transition: transform 0.3s ease; }
  .card:hover { transform: translateY(-5px); }
  
  .form-control:focus {
    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
    border-color: #0d6efd;
  }
  
  .btn-primary {
    background: linear-gradient(135deg, #0d6efd, #0dcaf0);
    border: none;
    transition: opacity 0.2s;
  }
  
  .btn-primary:hover { opacity: 0.9; }
  
  .btn-success {
    background: linear-gradient(135deg, #198754, #20c997);
    border: none;
  }
  
  /* Success Modal Animation */
  #successModal .modal-content {
    animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
  
  @keyframes bounceIn {
    0% { transform: scale(0.5); opacity: 0; }
    100% { transform: scale(1); opacity: 1; }
  }
  </style>