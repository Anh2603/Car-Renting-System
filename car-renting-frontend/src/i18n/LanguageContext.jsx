import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const LANGUAGE_STORAGE_KEY = 'carRentalLanguage';
const SUPPORTED_LANGUAGES = ['en', 'vi'];

const translations = {
  en: {
    navbar: {
      tagline: 'Premium rental booking',
      login: 'Log in',
      hello: 'Hello',
      customerAccount: 'Customer account',
      myProfile: 'My Profile',
      changePassword: 'Change Password',
      myBookings: 'My Bookings',
      adminPanel: 'Admin Panel',
      staffPanel: 'Staff Panel',
      logout: 'Logout',
      menu: 'Menu',
      switchLanguage: 'Switch to Vietnamese',
    },
    menu: {
      brandSubtitle: 'Customer rental guide',
      sectionLabel: 'Main Menu',
      close: 'Close menu',
      items: {
        home: {
          label: 'Home',
          description: 'Return to the homepage and rental overview.',
        },
        book: {
          label: 'Book a Car',
          description: 'Choose pickup area, rental dates, and time.',
        },
        fleet: {
          label: 'Cars / Fleet',
          description: 'Browse available cars by vehicle type.',
        },
        guide: {
          label: 'Booking Guide',
          description: 'Review the steps from schedule to checkout.',
        },
        contact: {
          label: 'Contact Support',
          description: 'Open the support form for booking help.',
        },
        terms: {
          label: 'Terms of Service',
          description: 'Read rental rules and customer responsibilities.',
        },
      },
    },
    bookingWidget: {
      cars: 'Cars',
      pickupArea: 'Pickup Area',
      selectDistrict: 'Select district',
      city: 'Ho Chi Minh City',
      note: 'Service available in Ho Chi Minh City inner districts.',
      pickupDate: 'Pickup Date',
      returnDate: 'Return Date',
      pickupDatePlaceholder: 'Pick-up date',
      returnDatePlaceholder: 'Return date',
      showCars: 'Show Cars',
      selectPickupAlert: 'Please select a pickup district.',
    },
    home: {
      heroEyebrow: 'Fast. Simple. Reliable.',
      heroTitleLine1: 'Premium Rentals',
      heroTitleLine2: 'For Every Journey',
      heroTitleLine3: '',
      heroDescription:
        'Book the right car for your schedule with a clear, guided rental experience.',
      startBooking: 'Start Booking',
      chooseDateTime: 'Choose Date & Time',
      supportEyebrow: 'Contact Support',
      supportTitle: 'Need help with your booking?',
      supportText:
        'Customers can contact our rental support team for booking questions, payment issues, pickup or return support, and account assistance.',
      sendSupportRequest: 'Send Support Request',
      openMyBookings: 'Open My Bookings',
      loginToViewBookings: 'Login To View Bookings',
      rentalSupport: 'Rental Support',
      hotline: 'Hotline',
      email: 'Email',
      address: 'Address',
    },
    footer: {
      navigate: 'Navigate',
      official: 'Official',
      support: 'Support',
      home: 'Home',
      book: 'Book a Car',
      fleet: 'Cars / Fleet',
      contact: 'Contact',
      terms: 'Terms of Service',
      rentalPolicy: 'Rental Policy',
      cancellationPolicy: 'Cancellation & Refund Policy',
      pickupPolicy: 'Pickup & Return Policy',
      paymentPolicy: 'Payment Policy',
      hours: "We're here Mon-Sun 8:00 AM - 10:00 PM GMT+7.",
      hotline: 'Hotline: +84 846 260 304',
      email: 'Email: suddenalice@gmail.com',
      pickupSupport: 'HCMC pickup support',
      copyright: '© 2026 The Car Renting System',
      closePolicy: 'Close policy',
      policies: {
        terms: {
          eyebrow: 'Customer Agreement',
          title: 'Terms of Service',
          intro:
            'These terms explain the main rules customers should understand before creating a rental booking in The Car Renting System.',
          sections: [
            ['1. Booking information', 'Customers must provide accurate renter details, phone number, driver license number, pickup address, pickup date, and return date before confirming a booking.'],
            ['2. Vehicle availability', 'A vehicle is only available when it has no active booking that overlaps with the selected rental schedule. Cancelled and completed bookings do not block future rentals.'],
            ['3. Payment responsibility', 'Bank Card bookings are treated as paid when the demo payment succeeds. Cash bookings are confirmed first, and the customer pays at pickup.'],
            ['4. Pickup and return', 'The customer should pick up and return the vehicle on the selected schedule. Staff can verify renter information, mark pickup, complete return, and update vehicle status.'],
            ['5. Cancellation', 'Admin or staff may cancel invalid bookings. Once a booking is cancelled, the car becomes available again for matching dates.'],
          ],
        },
        rental: {
          eyebrow: 'Official Policy',
          title: 'Rental Policy',
          intro: 'This policy explains the basic requirements for renting a car through the system.',
          sections: [
            ['Renter requirements', 'The renter should provide full name, phone number, driver license number, and pickup address before creating a booking.'],
            ['Vehicle selection', 'Cars are grouped into Economy, SUVs & 7-Seaters, and Premium. The Fleet page shows vehicles that match the selected dates and category.'],
            ['Booking status', 'Bookings can move through PENDING, CONFIRMED, PICKED_UP, COMPLETED, or CANCELLED depending on payment and staff operation.'],
          ],
        },
        cancellation: {
          eyebrow: 'Official Policy',
          title: 'Cancellation & Refund Policy',
          intro: 'This policy explains how cancelled bookings and payments should be handled in the demo flow.',
          sections: [
            ['Cancelled bookings', 'When a booking becomes CANCELLED, it no longer blocks the vehicle from appearing for the same schedule.'],
            ['Cash payments', 'For Cash bookings, payment normally starts as PENDING. If the booking is cancelled before pickup, Admin can mark the payment as FAILED or leave it as pending history.'],
            ['Bank Card payments', 'For Bank Card demo payments, payment becomes SUCCESS. If the booking is later cancelled, Admin can mark the payment as REFUNDED.'],
          ],
        },
        pickup: {
          eyebrow: 'Official Policy',
          title: 'Pickup & Return Policy',
          intro: 'This policy explains the staff operation flow after a customer confirms a rental booking.',
          sections: [
            ['Pickup flow', 'Staff verifies the confirmed booking and renter details. When the car is handed over, booking status becomes PICKED_UP and car status becomes RENTED.'],
            ['Return flow', 'When the customer returns the car, staff completes the booking. The car becomes AVAILABLE again unless it needs maintenance.'],
            ['Maintenance case', 'If the returned vehicle has an issue, staff or admin can set the car status to MAINTENANCE before making it available again.'],
          ],
        },
        payment: {
          eyebrow: 'Official Policy',
          title: 'Payment Policy',
          intro: 'This policy explains the two payment methods used in the current customer flow.',
          sections: [
            ['Bank Card', 'Bank Card is a demo online payment method. After successful checkout, booking status becomes CONFIRMED and payment status becomes SUCCESS.'],
            ['Cash', 'Cash means pay at pickup. The booking is still CONFIRMED, but payment status remains PENDING until staff receives the cash.'],
            ['Admin payment control', 'Admin can review payment history and update payment status when a booking is cancelled, refunded, failed, or completed.'],
          ],
        },
      },
    },
    success: {
      noBookingTitle: 'No Booking Found',
      noBookingSubtitle: 'Please select a car and complete checkout first.',
      backHome: 'Back to Home',
      bookingConfirmed: 'Booking Confirmed!',
      your: 'Your',
      bookedSuccessfully: 'has been booked successfully.',
      cashMessage: 'Your booking has been confirmed. Please pay in cash when you pick up the vehicle.',
      cardMessage: 'Your booking and demo bank card payment have been completed successfully.',
      bookingReference: 'Booking Reference',
      paymentReference: 'Payment Reference',
      amountDueAtPickup: 'Amount Due at Pickup',
      totalPaid: 'Total Paid',
      bookingStatus: 'Booking Status',
      paymentMethod: 'Payment Method',
      paymentStatus: 'Payment Status',
      cash: 'Cash',
      bankCard: 'Bank Card',
      cashNote: 'Please bring the booking reference, driver license, and cash amount when receiving the car.',
      rentalConfirmation: 'Rental Confirmation Details',
      rentalProvider: 'Rental Provider',
      receiver: 'Receiver',
      company: 'Company',
      representative: 'Representative',
      phone: 'Phone',
      branch: 'Branch',
      handoverStatus: 'Handover Status',
      readyForPickup: 'Ready for pickup',
      fullName: 'Full Name',
      driverLicense: 'Driver License',
      pickupAddress: 'Pickup Address',
      customerNote: 'Customer Note',
      vehicleRentalInfo: 'Vehicle & Rental Information',
      car: 'Car',
      brandModel: 'Brand / Model',
      year: 'Year',
      licensePlate: 'License Plate',
      seats: 'Seats',
      transmission: 'Transmission',
      fuelType: 'Fuel Type',
      pickupTime: 'Pickup Time',
      returnTime: 'Return Time',
      pickupLocation: 'Pickup Location',
      returnLocation: 'Return Location',
      selectedCar: 'Selected Car',
      notProvided: 'Not provided',
      noNote: 'No note',
      updating: 'Updating',
    },
    checkout: {
      noCarTitle: 'No car selected',
      noCarSubtitle: 'Please choose a vehicle first.',
      title: 'Secure Checkout',
      subtitle: 'Review your booking details and choose your preferred payment method.',
      selectedVehicle: 'Selected Vehicle',
      pickup: 'Pickup',
      return: 'Return',
      duration: 'Duration',
      days: 'Days',
      dailyRate: 'Daily Rate',
      total: 'Total',
      paymentMethod: 'Payment Method',
      bankCard: 'Bank Card',
      bankCardNote: 'Demo bank card payment',
      cash: 'Cash',
      cashNote: 'Pay at pickup',
      payAtPickup: 'Pay at pickup',
      cashDescription: 'Your booking will be confirmed now. Payment will stay pending until staff receives the cash when you pick up the vehicle.',
      amountDueAtPickup: 'Amount due at pickup',
      demoNote: 'This is a demo bank card checkout. No real money will be charged. A successful demo bank card payment will confirm your booking immediately.',
      cardNumber: 'Card Number',
      expiryDate: 'Expiry Date',
      processing: 'Processing...',
      confirmBooking: 'Confirm Booking',
      confirmPay: 'Confirm & Pay',
      alerts: {
        card: 'Please enter a valid demo bank card number.',
        expiry: 'Please enter a valid expiry date.',
        cvv: 'Please enter a valid CVV.',
      },
    },
    myBookings: {
      eyebrow: 'Your rentals',
      title: 'My Bookings',
      loading: 'Loading your bookings...',
      loginRequired: 'Please login to view your bookings.',
      loadError: 'Cannot load your bookings right now.',
      loginButton: 'Go to Login',
      empty: 'You do not have any bookings yet.',
      browseCars: 'Browse Cars',
      rentalCar: 'Rental Car',
      pickup: 'Pickup',
      return: 'Return',
      location: 'Location',
      total: 'Total',
      perDay: 'VND/day',
      payment: 'Payment',
      unpaid: 'UNPAID',
      cashPendingNote: 'Bring cash and your driver license when picking up the vehicle.',
      cancelConfirm: 'Cancel this booking?',
      cancelError: 'Cannot cancel this booking right now.',
      cancelling: 'Cancelling...',
      cancelBooking: 'Cancel Booking',
      cashMethod: 'Cash - Pay at pickup',
      bankCardMethod: 'Bank Card',
    },
    contact: {
      title: 'Contact Us',
      intro1:
        'Feel free to reach out to us at any time. We are here to help with booking questions, payment issues, pickup and return support, and any feedback about your rental experience.',
      intro2:
        'Our rental support team can assist every day from 8:00 AM to 10:00 PM GMT+7. We will aim to get back to you as soon as possible.',
      requiredNote: '* indicates a required field',
      submitted:
        'Your support request has been submitted. Our admin or staff team can now check it in the system.',
      fullName: 'First and Last Name*',
      email: 'Email*',
      contactReason: 'Contact Reason*',
      topic: 'Topic*',
      details: 'Tell us the details.*',
      attach: 'Attach file',
      attachVi: 'Thêm tệp đính kèm',
      submitting: 'Submitting...',
      submit: 'Submit',
      ariaContactReason: 'Contact Reason',
      errors: {
        fullName: 'Please enter your first and last name.',
        email: 'Please enter your email address.',
        contactReason: 'Please select a contact reason.',
        topic: 'Please enter a topic.',
        details: 'Please tell us the details.',
        submit: 'Could not submit your support request.',
      },
      reasons: {
        booking: 'Booking issue',
        payment: 'Payment issue',
        pickup: 'Pickup / return support',
        availability: 'Car availability',
        account: 'Account support',
        general: 'General question',
      },
    },
  },
  vi: {
    navbar: {
      tagline: 'Đặt xe cao cấp',
      login: 'Đăng nhập',
      hello: 'Xin chào',
      customerAccount: 'Tài khoản khách hàng',
      myProfile: 'Hồ sơ của tôi',
      changePassword: 'Đổi mật khẩu',
      myBookings: 'Đơn thuê của tôi',
      adminPanel: 'Bảng quản trị',
      staffPanel: 'Bảng nhân viên',
      logout: 'Đăng xuất',
      menu: 'Menu',
      switchLanguage: 'Chuyển sang tiếng Anh',
    },
    menu: {
      brandSubtitle: 'Hướng dẫn thuê xe',
      sectionLabel: 'Menu chính',
      close: 'Đóng menu',
      items: {
        home: {
          label: 'Trang chủ',
          description: 'Quay về trang chính và thông tin tổng quan.',
        },
        book: {
          label: 'Đặt xe',
          description: 'Chọn khu vực nhận xe, ngày thuê và thời gian.',
        },
        fleet: {
          label: 'Danh sách xe',
          description: 'Xem xe còn trống theo từng loại xe.',
        },
        guide: {
          label: 'Hướng dẫn đặt xe',
          description: 'Xem các bước từ chọn lịch đến thanh toán.',
        },
        contact: {
          label: 'Hỗ trợ khách hàng',
          description: 'Mở form hỗ trợ khi cần trợ giúp về booking.',
        },
        terms: {
          label: 'Điều khoản dịch vụ',
          description: 'Đọc quy định thuê xe và trách nhiệm của khách hàng.',
        },
      },
    },
    bookingWidget: {
      cars: 'Xe',
      pickupArea: 'Khu vực nhận xe',
      selectDistrict: 'Chọn quận/khu vực',
      city: 'Thành phố Hồ Chí Minh',
      note: 'Dịch vụ hỗ trợ trong các quận nội thành TP.HCM.',
      pickupDate: 'Ngày nhận xe',
      returnDate: 'Ngày trả xe',
      pickupDatePlaceholder: 'Ngày nhận xe',
      returnDatePlaceholder: 'Ngày trả xe',
      showCars: 'Xem xe',
      selectPickupAlert: 'Vui lòng chọn khu vực nhận xe.',
    },
    home: {
      heroEyebrow: 'Nhanh. Đơn giản. Đáng tin cậy.',
      heroTitleLine1: 'Thuê xe cao cấp',
      heroTitleLine2: 'Cho mọi hành trình',
      heroTitleLine3: '',
      heroDescription:
        'Đặt chiếc xe phù hợp với lịch trình của bạn thông qua quy trình thuê xe rõ ràng và dễ sử dụng.',
      startBooking: 'Bắt đầu đặt xe',
      chooseDateTime: 'Chọn ngày & giờ',
      supportEyebrow: 'Hỗ trợ khách hàng',
      supportTitle: 'Bạn cần hỗ trợ về đơn thuê?',
      supportText:
        'Khách hàng có thể liên hệ đội hỗ trợ về booking, thanh toán, nhận/trả xe và vấn đề tài khoản.',
      sendSupportRequest: 'Gửi yêu cầu hỗ trợ',
      openMyBookings: 'Mở đơn thuê của tôi',
      loginToViewBookings: 'Đăng nhập để xem đơn thuê',
      rentalSupport: 'Hỗ trợ thuê xe',
      hotline: 'Hotline',
      email: 'Email',
      address: 'Địa chỉ',
    },
    footer: {
      navigate: 'Điều hướng',
      official: 'Chính sách',
      support: 'Hỗ trợ',
      home: 'Trang chủ',
      book: 'Đặt xe',
      fleet: 'Danh sách xe',
      contact: 'Liên hệ',
      terms: 'Điều khoản dịch vụ',
      rentalPolicy: 'Chính sách thuê xe',
      cancellationPolicy: 'Chính sách hủy & hoàn tiền',
      pickupPolicy: 'Chính sách nhận & trả xe',
      paymentPolicy: 'Chính sách thanh toán',
      hours: 'Hỗ trợ mỗi ngày 8:00 AM - 10:00 PM GMT+7.',
      hotline: 'Hotline: +84 846 260 304',
      email: 'Email: suddenalice@gmail.com',
      pickupSupport: 'Hỗ trợ nhận xe tại TP.HCM',
      copyright: '© 2026 The Car Renting System',
      closePolicy: 'Đóng chính sách',
      policies: {
        terms: {
          eyebrow: 'Thỏa thuận khách hàng',
          title: 'Điều khoản dịch vụ',
          intro:
            'Điều khoản này giải thích các quy định chính khách hàng cần hiểu trước khi tạo đơn thuê xe trong hệ thống.',
          sections: [
            ['1. Thông tin đặt xe', 'Khách hàng cần cung cấp chính xác họ tên, số điện thoại, số giấy phép lái xe, địa chỉ nhận xe, ngày nhận và ngày trả trước khi xác nhận booking.'],
            ['2. Tình trạng xe còn trống', 'Xe chỉ được xem là còn trống nếu không có booking đang hoạt động trùng với lịch thuê đã chọn. Booking đã hủy hoặc hoàn tất không chặn lịch thuê mới.'],
            ['3. Trách nhiệm thanh toán', 'Bank Card được xem là đã thanh toán khi thanh toán demo thành công. Cash được xác nhận booking trước và khách trả tiền khi nhận xe.'],
            ['4. Nhận và trả xe', 'Khách hàng cần nhận và trả xe đúng lịch đã chọn. Nhân viên có thể xác minh thông tin, đánh dấu nhận xe, hoàn tất trả xe và cập nhật trạng thái xe.'],
            ['5. Hủy booking', 'Admin hoặc staff có thể hủy booking không hợp lệ. Khi booking bị hủy, xe sẽ được mở lại cho lịch thuê phù hợp.'],
          ],
        },
        rental: {
          eyebrow: 'Chính sách chính thức',
          title: 'Chính sách thuê xe',
          intro: 'Chính sách này giải thích các yêu cầu cơ bản khi thuê xe qua hệ thống.',
          sections: [
            ['Yêu cầu người thuê', 'Người thuê cần cung cấp họ tên, số điện thoại, số giấy phép lái xe và địa chỉ nhận xe trước khi tạo booking.'],
            ['Chọn xe', 'Xe được chia thành Economy, SUVs & 7-Seaters và Premium. Fleet page sẽ hiển thị xe phù hợp với ngày thuê và loại xe đã chọn.'],
            ['Trạng thái booking', 'Booking có thể chuyển qua PENDING, CONFIRMED, PICKED_UP, COMPLETED hoặc CANCELLED tùy theo thanh toán và thao tác của staff.'],
          ],
        },
        cancellation: {
          eyebrow: 'Chính sách chính thức',
          title: 'Chính sách hủy & hoàn tiền',
          intro: 'Chính sách này giải thích cách xử lý booking bị hủy và thanh toán trong flow demo.',
          sections: [
            ['Booking bị hủy', 'Khi booking chuyển sang CANCELLED, booking đó không còn chặn xe trong cùng lịch thuê.'],
            ['Thanh toán Cash', 'Với Cash, payment thường bắt đầu là PENDING. Nếu booking bị hủy trước khi nhận xe, Admin có thể chuyển payment sang FAILED hoặc giữ làm lịch sử pending.'],
            ['Thanh toán Bank Card', 'Với Bank Card demo, payment chuyển thành SUCCESS. Nếu booking bị hủy sau đó, Admin có thể chuyển payment sang REFUNDED.'],
          ],
        },
        pickup: {
          eyebrow: 'Chính sách chính thức',
          title: 'Chính sách nhận & trả xe',
          intro: 'Chính sách này giải thích flow vận hành staff sau khi khách xác nhận booking.',
          sections: [
            ['Flow nhận xe', 'Staff xác minh booking đã xác nhận và thông tin người thuê. Khi giao xe, booking chuyển thành PICKED_UP và xe chuyển thành RENTED.'],
            ['Flow trả xe', 'Khi khách trả xe, staff hoàn tất booking. Xe chuyển lại AVAILABLE trừ khi cần bảo trì.'],
            ['Trường hợp bảo trì', 'Nếu xe có vấn đề sau khi trả, staff hoặc admin có thể đặt trạng thái xe thành MAINTENANCE trước khi mở lại.'],
          ],
        },
        payment: {
          eyebrow: 'Chính sách chính thức',
          title: 'Chính sách thanh toán',
          intro: 'Chính sách này giải thích hai phương thức thanh toán trong flow hiện tại.',
          sections: [
            ['Bank Card', 'Bank Card là phương thức thanh toán online demo. Sau checkout thành công, booking chuyển thành CONFIRMED và payment thành SUCCESS.'],
            ['Cash', 'Cash nghĩa là trả tiền khi nhận xe. Booking vẫn được CONFIRMED, nhưng payment giữ PENDING cho đến khi staff nhận tiền.'],
            ['Admin quản lý payment', 'Admin có thể xem lịch sử payment và cập nhật trạng thái khi booking bị hủy, hoàn tiền, thất bại hoặc hoàn tất.'],
          ],
        },
      },
    },
    success: {
      noBookingTitle: 'Không tìm thấy booking',
      noBookingSubtitle: 'Vui lòng chọn xe và hoàn tất checkout trước.',
      backHome: 'Về trang chủ',
      bookingConfirmed: 'Booking đã được xác nhận!',
      your: 'Xe',
      bookedSuccessfully: 'đã được đặt thành công.',
      cashMessage: 'Booking đã được xác nhận. Vui lòng thanh toán tiền mặt khi nhận xe.',
      cardMessage: 'Booking và thanh toán thẻ demo đã hoàn tất thành công.',
      bookingReference: 'Mã booking',
      paymentReference: 'Mã thanh toán',
      amountDueAtPickup: 'Số tiền cần trả khi nhận xe',
      totalPaid: 'Tổng đã thanh toán',
      bookingStatus: 'Trạng thái booking',
      paymentMethod: 'Phương thức thanh toán',
      paymentStatus: 'Trạng thái thanh toán',
      cash: 'Tiền mặt',
      bankCard: 'Thẻ ngân hàng',
      cashNote: 'Vui lòng mang mã booking, giấy phép lái xe và tiền mặt khi nhận xe.',
      rentalConfirmation: 'Chi tiết xác nhận thuê xe',
      rentalProvider: 'Bên cho thuê',
      receiver: 'Người nhận xe',
      company: 'Công ty',
      representative: 'Đại diện',
      phone: 'Số điện thoại',
      branch: 'Chi nhánh',
      handoverStatus: 'Trạng thái bàn giao',
      readyForPickup: 'Sẵn sàng nhận xe',
      fullName: 'Họ và tên',
      driverLicense: 'Giấy phép lái xe',
      pickupAddress: 'Địa chỉ nhận xe',
      customerNote: 'Ghi chú khách hàng',
      vehicleRentalInfo: 'Thông tin xe và lịch thuê',
      car: 'Xe',
      brandModel: 'Hãng / mẫu xe',
      year: 'Năm',
      licensePlate: 'Biển số',
      seats: 'Số ghế',
      transmission: 'Hộp số',
      fuelType: 'Nhiên liệu',
      pickupTime: 'Thời gian nhận',
      returnTime: 'Thời gian trả',
      pickupLocation: 'Địa điểm nhận',
      returnLocation: 'Địa điểm trả',
      selectedCar: 'Xe đã chọn',
      notProvided: 'Chưa cung cấp',
      noNote: 'Không có ghi chú',
      updating: 'Đang cập nhật',
    },
    checkout: {
      noCarTitle: 'Chưa chọn xe',
      noCarSubtitle: 'Vui lòng chọn xe trước.',
      title: 'Thanh toán an toàn',
      subtitle: 'Kiểm tra thông tin booking và chọn phương thức thanh toán.',
      selectedVehicle: 'Xe đã chọn',
      pickup: 'Nhận xe',
      return: 'Trả xe',
      duration: 'Thời gian thuê',
      days: 'ngày',
      dailyRate: 'Giá mỗi ngày',
      total: 'Tổng cộng',
      paymentMethod: 'Phương thức thanh toán',
      bankCard: 'Thẻ ngân hàng',
      bankCardNote: 'Thanh toán thẻ demo',
      cash: 'Tiền mặt',
      cashNote: 'Trả khi nhận xe',
      payAtPickup: 'Trả tiền khi nhận xe',
      cashDescription: 'Booking sẽ được xác nhận ngay. Payment giữ PENDING cho đến khi nhân viên nhận tiền mặt lúc giao xe.',
      amountDueAtPickup: 'Số tiền cần trả khi nhận xe',
      demoNote: 'Đây là thanh toán thẻ demo. Không có tiền thật bị trừ. Thanh toán demo thành công sẽ xác nhận booking ngay.',
      cardNumber: 'Số thẻ',
      expiryDate: 'Ngày hết hạn',
      processing: 'Đang xử lý...',
      confirmBooking: 'Xác nhận booking',
      confirmPay: 'Xác nhận & thanh toán',
      alerts: {
        card: 'Vui lòng nhập số thẻ demo hợp lệ.',
        expiry: 'Vui lòng nhập ngày hết hạn hợp lệ.',
        cvv: 'Vui lòng nhập CVV hợp lệ.',
      },
    },
    myBookings: {
      eyebrow: 'Đơn thuê của bạn',
      title: 'Đơn thuê của tôi',
      loading: 'Đang tải đơn thuê...',
      loginRequired: 'Vui lòng đăng nhập để xem đơn thuê.',
      loadError: 'Hiện tại không thể tải đơn thuê.',
      loginButton: 'Đăng nhập',
      empty: 'Bạn chưa có đơn thuê nào.',
      browseCars: 'Xem xe',
      rentalCar: 'Xe thuê',
      pickup: 'Nhận xe',
      return: 'Trả xe',
      location: 'Địa điểm',
      total: 'Tổng cộng',
      perDay: 'VND/ngày',
      payment: 'Thanh toán',
      unpaid: 'CHƯA THANH TOÁN',
      cashPendingNote: 'Mang theo tiền mặt và giấy phép lái xe khi nhận xe.',
      cancelConfirm: 'Hủy booking này?',
      cancelError: 'Hiện tại không thể hủy booking này.',
      cancelling: 'Đang hủy...',
      cancelBooking: 'Hủy booking',
      cashMethod: 'Tiền mặt - trả khi nhận xe',
      bankCardMethod: 'Thẻ ngân hàng',
    },
    contact: {
      title: 'Liên hệ',
      intro1:
        'Bạn có thể liên hệ với chúng tôi bất cứ lúc nào. Đội hỗ trợ có thể giúp về booking, thanh toán, nhận/trả xe và phản hồi về trải nghiệm thuê xe.',
      intro2:
        'Đội hỗ trợ hoạt động mỗi ngày từ 8:00 AM đến 10:00 PM GMT+7. Chúng tôi sẽ phản hồi sớm nhất có thể.',
      requiredNote: '* là trường bắt buộc',
      submitted:
        'Yêu cầu hỗ trợ đã được gửi. Admin hoặc staff có thể kiểm tra trong hệ thống.',
      fullName: 'Họ và tên*',
      email: 'Email*',
      contactReason: 'Lý do liên hệ*',
      topic: 'Chủ đề*',
      details: 'Nội dung chi tiết.*',
      attach: 'Thêm tệp đính kèm',
      attachVi: 'Thêm tệp đính kèm',
      submitting: 'Đang gửi...',
      submit: 'Gửi',
      ariaContactReason: 'Lý do liên hệ',
      errors: {
        fullName: 'Vui lòng nhập họ và tên.',
        email: 'Vui lòng nhập email.',
        contactReason: 'Vui lòng chọn lý do liên hệ.',
        topic: 'Vui lòng nhập chủ đề.',
        details: 'Vui lòng nhập nội dung chi tiết.',
        submit: 'Không thể gửi yêu cầu hỗ trợ.',
      },
      reasons: {
        booking: 'Vấn đề booking',
        payment: 'Vấn đề thanh toán',
        pickup: 'Hỗ trợ nhận/trả xe',
        availability: 'Tình trạng xe còn trống',
        account: 'Hỗ trợ tài khoản',
        general: 'Câu hỏi chung',
      },
    },
  },
};

function readInitialLanguage() {
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(savedLanguage)) return savedLanguage;
  } catch (error) {
    // Ignore storage errors and fall back to English.
  }

  return 'en';
}

function readPath(source, path) {
  return path.split('.').reduce((currentValue, key) => {
    if (currentValue == null) return undefined;
    return currentValue[key];
  }, source);
}

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;

    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch (error) {
      // Ignore storage errors.
    }
  }, [language]);

  const value = useMemo(() => {
    const setLanguage = (nextLanguage) => {
      setLanguageState(SUPPORTED_LANGUAGES.includes(nextLanguage) ? nextLanguage : 'en');
    };

    const toggleLanguage = () => {
      setLanguageState((currentLanguage) => (currentLanguage === 'en' ? 'vi' : 'en'));
    };

    const t = (key, fallback = '') => {
      const translatedValue = readPath(translations[language], key);
      if (translatedValue !== undefined) return translatedValue;

      const englishValue = readPath(translations.en, key);
      if (englishValue !== undefined) return englishValue;

      return fallback || key;
    };

    return {
      language,
      languageLabel: language === 'en' ? 'EN' : 'VI',
      nextLanguageLabel: language === 'en' ? 'VI' : 'EN',
      setLanguage,
      toggleLanguage,
      t,
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider.');
  }

  return context;
}

export default LanguageContext;
