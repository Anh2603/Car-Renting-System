USE car_renting_system;

-- Seed demo cars only. This file does not create admin accounts.
-- It resets bookings, payments, and cars to avoid duplicated car rows when running seed.sql again.

SET SQL_SAFE_UPDATES = 0;
SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM payments;
DELETE FROM bookings;
DELETE FROM cars;

ALTER TABLE payments AUTO_INCREMENT = 1;
ALTER TABLE bookings AUTO_INCREMENT = 1;
ALTER TABLE cars AUTO_INCREMENT = 1;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO cars
(
  name,
  brand,
  model,
  year,
  category,
  price_per_day,
  image_url,
  transmission,
  fuel_type,
  seats,
  status,
  description
)
VALUES
-- ECONOMY CARS: 8 cars
(
  'Toyota Vios 2022',
  'Toyota',
  'Vios',
  2022,
  'ECONOMY',
  900000,
  'https://toyotavinhphucht.com/wp-content/uploads/2025/03/gia-xe-vios-2022-bid497.jpg',
  'Automatic',
  'E5 RON 92',
  5,
  'AVAILABLE',
  'Economy sedan for daily city trips, short errands, and affordable rentals.'
),
(
  'Hyundai Accent 2022',
  'Hyundai',
  'Accent',
  2022,
  'ECONOMY',
  1000000,
  'https://files01.danhgiaxe.com/344qMFUedqjoE66z9vSDTtUrJrw=/fit-in/1280x0/20211216/hyundaiaccent20212-1606809474-9343-3015-1606809559-231525-120435.jpeg',
  'Automatic',
  'E5 RON 92',
  5,
  'AVAILABLE',
  'Budget-friendly compact car with good fuel efficiency and easy city handling.'
),
(
  'Kia Morning 2022',
  'Kia',
  'Morning',
  2022,
  'ECONOMY',
  700000,
  'https://phuclamauto.vn/?attachment_id=9979',
  'Automatic',
  'E5 RON 92',
  4,
  'AVAILABLE',
  'Compact economy car for city driving, easy parking, and low rental cost.'
),
(
  'Honda City 2022',
  'Honda',
  'City',
  2022,
  'ECONOMY',
  900000,
  'https://thanhnienviet.mediacdn.vn/zoom/700_438/uploads/2022_08/city-cf59.jpg',
  'Automatic',
  'RON 95',
  5,
  'AVAILABLE',
  'Reliable economy sedan with comfortable seats and good fuel efficiency.'
),
(
  'Mazda 2 2021',
  'Mazda',
  '2',
  2021,
  'ECONOMY',
  850000,
  'https://cdn-img-v2.mybota.vn/uploadv2/web/89/8958/product/2023/10/30/04/46/1698638020_2.jpg?v=4',
  'Automatic',
  'RON 95',
  5,
  'AVAILABLE',
  'Stylish small sedan suitable for daily travel and short family trips.'
),
(
  'Mitsubishi Attrage 2022',
  'Mitsubishi',
  'Attrage',
  2022,
  'ECONOMY',
  800000,
  'https://www.mitsubishitrungthuong.org/files/mitsubishi-attrage-1-bakMYipOpz.jpg',
  'Automatic',
  'E5 RON 92',
  5,
  'AVAILABLE',
  'Affordable economy sedan with simple operation and low fuel consumption.'
),
(
  'Nissan Almera 2022',
  'Nissan',
  'Almera',
  2022,
  'ECONOMY',
  850000,
  'https://nissansprings.co.za/wp-content/uploads/Nissan-Almera-Overview.jpg',
  'Automatic',
  'E5 RON 92',
  5,
  'AVAILABLE',
  'Fuel-saving economy sedan with practical space and comfortable city driving.'
),
(
  'Suzuki Ciaz 2021',
  'Suzuki',
  'Ciaz',
  2021,
  'ECONOMY',
  750000,
  'https://longbiensuzuki.vn/wp-content/uploads/2021/02/maruti-suzuki-ciaz-pearl-snow-white.jpg',
  'Automatic',
  'E5 RON 92',
  5,
  'AVAILABLE',
  'Simple and affordable sedan for customers who need a budget-friendly rental car.'
),

-- SUV CARS: 8 cars
(
  'Hyundai Tucson 2022',
  'Hyundai',
  'Tucson',
  2022,
  'SUV',
  1800000,
  'https://cdn.shopify.com/s/files/1/0580/0031/0432/files/hyundai-tucson-2022-2_1024x1024.jpg?v=1657859572',
  'Automatic',
  'RON 95',
  5,
  'AVAILABLE',
  'Comfortable SUV suitable for family trips, luggage, and weekend travel.'
),
(
  'Toyota Fortuner 2021',
  'Toyota',
  'Fortuner',
  2021,
  'SUV',
  2200000,
  'https://admin.vov.gov.vn/UploadFolder/KhoTin/Images/UploadFolder/VOVVN/Images/w800/uploaded/gg9bpj0b1dmowa5zikow/2020_06_04/1_XGXI.png',
  'Automatic',
  'Diesel DO 0.05S',
  7,
  'AVAILABLE',
  'Spacious 7-seater SUV for families, group travel, and longer journeys.'
),
(
  'Mazda CX-5 2022',
  'Mazda',
  'CX-5',
  2022,
  'SUV',
  1800000,
  'https://cafefcdn.com/203337114487263232/2021/9/9/f17b3e713cecf1061f333df4cbacbcb0-1631181575991379058173.jpeg',
  'Automatic',
  'RON 95',
  5,
  'AVAILABLE',
  'Comfortable SUV with modern design, strong performance, and spacious cabin.'
),
(
  'Honda CR-V 2022',
  'Honda',
  'CR-V',
  2022,
  'SUV',
  2000000,
  'https://cdn1.otosaigon.com/data/carinfo/20210806/4uHFSmBcnyDUlARE2X13a9dEVehfCYerKcDKwjlL.png',
  'Automatic',
  'RON 95',
  7,
  'AVAILABLE',
  'Family SUV with flexible seating, strong safety features, and smooth driving.'
),
(
  'Ford Everest 2021',
  'Ford',
  'Everest',
  2021,
  'SUV',
  2200000,
  'https://cafefcdn.com/203337114487263232/2020/11/16/photo-1-1605530039015982127483.jpg',
  'Automatic',
  'Diesel DO 0.05S',
  7,
  'AVAILABLE',
  'Powerful seven-seat SUV suitable for long trips, families, and group travel.'
),
(
  'Kia Seltos 2022',
  'Kia',
  'Seltos',
  2022,
  'SUV',
  1600000,
  'https://autobikes.vn/stores/news_dataimages/vantrinh/062022/30/10/4943_Kia_Seltos_2022_1.jpg?rt=20220802094611',
  'Automatic',
  'RON 95',
  5,
  'AVAILABLE',
  'Compact SUV with modern styling, comfortable interior, and good city performance.'
),
(
  'Mitsubishi Xpander 2022',
  'Mitsubishi',
  'Xpander',
  2022,
  'SUV',
  1400000,
  'https://thanhnien.mediacdn.vn/Uploaded/bahung/2022_06_12/mitsubishi-xpander-20224-7562.jpg',
  'Automatic',
  'RON 95',
  7,
  'AVAILABLE',
  'Seven-seat family car with spacious interior, good comfort, and practical luggage space.'
),
(
  'VinFast Lux SA2.0 2021',
  'VinFast',
  'Lux SA2.0',
  2021,
  'SUV',
  2300000,
  'https://shop.vinfastauto.com/on/demandware.static/-/Sites-app_vinfast_vn-Library/default/dw0dcaf51e/images/Lux-SA/hinh-anh-gia-VinFast-Lux-SA2.0-turbo-tra-gop-mau-trang-white.png',
  'Automatic',
  'RON 95',
  7,
  'AVAILABLE',
  'Large SUV with powerful engine, premium cabin, and comfortable long-distance driving.'
),

-- PREMIUM CARS: 6 cars
(
  'BMW X5 2022',
  'BMW',
  'X5',
  2022,
  'PREMIUM',
  3600000,
  'https://d2ivfcfbdvj3sm.cloudfront.net/sPWkE4zxxaUwT6DR/15303/stills_0640_png/MY2022/15303/15303_st0640_116.webp?c=172&p=164&m=1&o=png&s=2cXmIkLdm8ltra5cs_sQrC',
  'Automatic',
  'RON 95',
  7,
  'AVAILABLE',
  'Premium luxury SUV with spacious interior, strong performance, and advanced comfort.'
),
(
  'Mercedes-Benz C-Class 2023',
  'Mercedes-Benz',
  'C-Class',
  2023,
  'PREMIUM',
  4000000,
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkqSsru59D83j3VgrezNJTzhMTJemvwl0IzA&s',
  'Automatic',
  'RON 95',
  5,
  'AVAILABLE',
  'Premium sedan for business trips, events, and high-end rental experience.'
),
(
  'Audi A6 2022',
  'Audi',
  'A6',
  2022,
  'PREMIUM',
  3500000,
  'https://autopro8.mediacdn.vn/2022/1/10/audi-a6-l-facelift-china-5-1641807953423934674441.jpg',
  'Automatic',
  'RON 95',
  5,
  'AVAILABLE',
  'Premium sedan with elegant design, advanced technology, and smooth performance.'
),
(
  'Lexus RX 350 2022',
  'Lexus',
  'RX 350',
  2022,
  'PREMIUM',
  4500000,
  'https://dealerinspire-image-library-prod.s3.us-east-1.amazonaws.com/images/WEIgKKZB3WHnnrcw3clUAxq8XoI9ZMVtxgRWqIb4.jpeg',
  'Automatic',
  'RON 95',
  5,
  'AVAILABLE',
  'Luxury SUV with quiet cabin, high comfort, and premium driving experience.'
),
(
  'Volvo XC90 2022',
  'Volvo',
  'XC90',
  2022,
  'PREMIUM',
  5000000,
  'https://autopro8.mediacdn.vn/2022/2/16/2021-volvo-xc90-recharge-t8-front-quarter-tight-1645015514016802759865.jpg',
  'Automatic',
  'RON 95',
  7,
  'AVAILABLE',
  'Luxury seven-seat SUV with premium comfort, safety technology, and elegant design.'
),
(
  'Mercedes-Benz E-Class 2022',
  'Mercedes-Benz',
  'E-Class',
  2022,
  'PREMIUM',
  4200000,
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcbRl6nYY0UqUJmk2yU2VGhX8Fv_uKY6Rnsg&s',
  'Automatic',
  'RON 95',
  5,
  'AVAILABLE',
  'Executive premium sedan with luxurious interior, smooth ride, and elegant appearance.'
);


SET SQL_SAFE_UPDATES = 1;

SELECT category, COUNT(*) AS total_cars
FROM cars
GROUP BY category;

SELECT id, name, category, fuel_type, price_per_day, status
FROM cars
ORDER BY category, id;
