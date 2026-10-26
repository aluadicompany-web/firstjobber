# เผยแพร่เกมบน Cloudflare Pages แผน Free

เกมเป็นเว็บ Static ไม่มีเซิร์ฟเวอร์หรือฐานข้อมูลที่ต้องเช่า Repository จะเป็น Public หรือ Private ก็ได้ ไม่ต้องเปลี่ยนการตั้งค่าความเป็นส่วนตัว

## เชื่อม GitHub ครั้งเดียว แล้วอัปเดตอัตโนมัติ

1. เข้า https://dash.cloudflare.com/ สมัครหรือเข้าสู่ระบบด้วยแผน Free
2. เปิด **Workers & Pages → Create application → Pages → Connect to Git** (บางหน้าจอใช้คำว่า **Import an existing Git repository**)
3. เชื่อม GitHub และอนุญาต Repository `aluadicompany-web/firstjobber` หากเป็น Repository ขององค์กร อาจต้องให้เจ้าขององค์กรอนุมัติการเชื่อมต่อ
4. เลือก Repository แล้วตั้งค่า:
   - Project name: `firstjobber` (หรือชื่อที่ยังว่าง)
   - Production branch: `main`
   - Framework preset: `Vite` หรือ `None`
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: ว่างไว้ (รากของ Repository)
   - หากต้องระบุ Node ให้ใช้ `NODE_VERSION=22` ใน build environment
5. กด **Save and Deploy** เมื่อขึ้น **Success** ใช้ลิงก์ `*.pages.dev` ที่ Cloudflare แสดง

หลังจากนั้นทุกครั้งที่ Push เข้า `main` Cloudflare จะ Build และ Deploy ให้เอง ตรวจว่าเกมใหม่มี `v13` ใต้ฉาก และตอนลูกค้าเกิดจะเห็นข้อความกดเพื่อรับออเดอร์แทนรูปอาหาร

## เปิดเล่นทันทีด้วยไฟล์ ZIP (ทางเลือก)

หากยังไม่เชื่อม GitHub ใช้ **Pages → Use direct upload / Drag and drop your files** ตั้งชื่อเว็บ แล้วอัปโหลด ZIP ของโฟลเดอร์ `dist` (ต้องมี `index.html` ที่รากของ ZIP) กด Deploy แล้วใช้ลิงก์ที่ระบบสร้างให้ วิธีนี้อัปเดตแต่ละครั้งด้วยการอัปโหลดไฟล์ชุดใหม่ และโปรเจกต์แบบ Direct Upload ไม่สามารถสลับเป็น Git integration ในโปรเจกต์เดิมได้ จึงแนะนำวิธีเชื่อม GitHub ด้านบนสำหรับการพัฒนาต่อ

สร้าง ZIP ใหม่หลังแก้เกม:

```sh
npm ci
npm test
npm run build
```

ZIP เฉพาะเนื้อหาใน `dist/` ไม่รวม `node_modules`, `.git` หรือโฟลเดอร์โปรเจกต์ภายนอก

## สถานะการย้าย

โค้ดใช้พาธไฟล์แบบ relative แล้ว จึงรองรับทั้ง Pages ที่รากโดเมนและ GitHub project Pages ใต้ `/firstjobber/` ทดสอบภาพหน้าแรก การรับออเดอร์ การทำอาหาร การเสิร์ฟ การพักเกม มือถือ และ Reload จากไฟล์ Build แล้ว การเปิดโปรเจกต์จริงยังต้องเชื่อมบัญชีและกด Deploy บน Cloudflare; การ Push GitHub อย่างเดียวไม่สร้างบัญชีหรือเว็บ Cloudflare ให้โดยอัตโนมัติ

เมื่อเปิดเว็บ Cloudflare ได้แล้ว สามารถหยุดการ Deploy อัตโนมัติของไซต์เดิมใน Netlify ผ่าน Settings ของไซต์เดิมได้
