// NỘI DUNG HỌC. Sửa file này rồi chạy: node supabase/build-seed.mjs để tạo lại seed.sql
// Câu hỏi kiểm tra được tạo tự động từ câu mẫu và từ vựng.
const s = (en, vi, accepts = []) => ({ en, vi, accepts });
const w = (word, ipa, vi, example, example_vi) => ({ word, ipa, vi, example, example_vi });

export const LEVELS = [
  { id: 1, code: 'Level 1', cefr: 'A1 - Beginner 1', title_vi: 'Chào hỏi và giới thiệu', outcome_vi: 'Chào hỏi, giới thiệu bản thân và nói thông tin cá nhân đơn giản.' },
  { id: 2, code: 'Level 2', cefr: 'A1 - Beginner 2', title_vi: 'Gia đình, bạn bè và nhà cửa', outcome_vi: 'Nói về người thân, bạn bè, nhà của bạn và các đồ vật quen thuộc.' },
  { id: 3, code: 'Level 3', cefr: 'A1 - Beginner 3', title_vi: 'Ăn uống, mua sắm và số đếm', outcome_vi: 'Gọi món, mua hàng, hỏi giá và dùng số đếm thường ngày.' },
  { id: 4, code: 'Level 4', cefr: 'A1 - Beginner 4', title_vi: 'Thói quen và thời gian', outcome_vi: 'Kể về một ngày của bạn và nói về thời gian.' },
  { id: 5, code: 'Level 5', cefr: 'A1 - Beginner 5', title_vi: 'Địa điểm, giao thông, thời tiết', outcome_vi: 'Hỏi địa điểm, đi lại và nói về thời tiết.' },
  { id: 6, code: 'Level 6', cefr: 'A2 - Elementary 1', title_vi: 'Công việc, học tập, sở thích', outcome_vi: 'Nói về công việc, việc học, sở thích và khả năng.' },
  { id: 7, code: 'Level 7', cefr: 'A2 - Elementary 2', title_vi: 'Du lịch và nhà hàng', outcome_vi: 'Xử lý tình huống khi đi du lịch, ở khách sạn và nhà hàng.' },
  { id: 8, code: 'Level 8', cefr: 'A2 - Elementary 3', title_vi: 'Sức khỏe, cảm xúc, kế hoạch', outcome_vi: 'Nói về sức khỏe, cảm xúc, trải nghiệm và kế hoạch.' },
  { id: 9, code: 'Level 9', cefr: 'B1 - Intermediate 1', title_vi: 'Kể chuyện và nêu ý kiến', outcome_vi: 'Kể lại trải nghiệm và trình bày ý kiến của mình.' },
  { id: 10, code: 'Level 10', cefr: 'B1 - Intermediate 2', title_vi: 'Giao tiếp công việc', outcome_vi: 'Thảo luận và xử lý tình huống trong công việc.' }
];

export const TOPICS = [
  // ---------- LEVEL 1 ----------
  { id: 'l1-greetings', level: 1, icon: '👋', en: 'Greetings', vi: 'Chào hỏi', goal: 'Chào hỏi và tạm biệt một cách tự nhiên.',
    sentences: [
      s('Hello, nice to meet you.', 'Xin chào, rất vui được gặp bạn.', ['hi nice to meet you']),
      s('Good morning, everyone.', 'Chào buổi sáng mọi người.'),
      s('How are you today?', 'Hôm nay bạn thế nào?'),
      s('I am fine, thank you.', 'Tôi khỏe, cảm ơn bạn.', ['fine thank you']),
      s('And you?', 'Còn bạn thì sao?'),
      s('Good night, my friend.', 'Chúc ngủ ngon, bạn của tôi.'),
      s('See you tomorrow.', 'Hẹn gặp bạn ngày mai.'),
      s('Goodbye and take care.', 'Tạm biệt và bảo trọng nhé.', ['bye and take care'])
    ],
    words: [
      w('hello', '/həˈloʊ/', 'xin chào', 'Hello, Tom!', 'Xin chào, Tom!'),
      w('morning', '/ˈmɔːrnɪŋ/', 'buổi sáng', 'I run in the morning.', 'Tôi chạy bộ vào buổi sáng.'),
      w('today', '/təˈdeɪ/', 'hôm nay', 'It is hot today.', 'Hôm nay trời nóng.'),
      w('fine', '/faɪn/', 'khỏe, ổn', 'My mother is fine.', 'Mẹ tôi khỏe.'),
      w('tomorrow', '/təˈmɑːroʊ/', 'ngày mai', 'I will call you tomorrow.', 'Ngày mai tôi sẽ gọi cho bạn.'),
      w('goodbye', '/ˌɡʊdˈbaɪ/', 'tạm biệt', 'Goodbye, teacher.', 'Em chào tạm biệt thầy cô.')
    ] },
  { id: 'l1-introduce', level: 1, icon: '🙋', en: 'Introducing Yourself', vi: 'Giới thiệu bản thân', goal: 'Nói tên và hỏi tên người khác.',
    sentences: [
      s('What is your name?', 'Bạn tên là gì?'),
      s('My name is Anna.', 'Tôi tên là Anna.', ['my name is ana', 'my name is hannah', 'my name is anne']),
      s('Please call me Tom.', 'Hãy gọi tôi là Tom.'),
      s('This is my friend Lan.', 'Đây là bạn tôi, Lan.', ['this is my friend lang', 'this is my friend lan']),
      s('Nice to meet you too.', 'Tôi cũng rất vui được gặp bạn.'),
      s('I am a student.', 'Tôi là sinh viên.'),
      s('I am a teacher.', 'Tôi là giáo viên.'),
      s('Are you a doctor?', 'Bạn có phải là bác sĩ không?')
    ],
    words: [
      w('name', '/neɪm/', 'tên', 'Her name is Lan.', 'Tên cô ấy là Lan.'),
      w('call', '/kɔːl/', 'gọi', 'Please call me.', 'Hãy gọi cho tôi nhé.'),
      w('friend', '/frend/', 'bạn bè', 'He is my friend.', 'Anh ấy là bạn của tôi.'),
      w('student', '/ˈstuːdənt/', 'học sinh, sinh viên', 'She is a good student.', 'Cô ấy là một học sinh giỏi.'),
      w('teacher', '/ˈtiːtʃər/', 'giáo viên', 'My teacher is kind.', 'Giáo viên của tôi rất tốt bụng.'),
      w('doctor', '/ˈdɑːktər/', 'bác sĩ', 'My father is a doctor.', 'Bố tôi là bác sĩ.')
    ] },
  { id: 'l1-country', level: 1, icon: '🌏', en: 'Countries & Languages', vi: 'Quốc gia và ngôn ngữ', goal: 'Nói bạn đến từ đâu và nói tiếng gì.',
    sentences: [
      s('Where are you from?', 'Bạn đến từ đâu?'),
      s('I am from Vietnam.', 'Tôi đến từ Việt Nam.'),
      s('She is from Japan.', 'Cô ấy đến từ Nhật Bản.'),
      s('I live in Hanoi.', 'Tôi sống ở Hà Nội.'),
      s('Where do you live?', 'Bạn sống ở đâu?'),
      s('Do you speak English?', 'Bạn có nói tiếng Anh không?'),
      s('I speak a little English.', 'Tôi nói được một chút tiếng Anh.'),
      s('I speak Vietnamese.', 'Tôi nói tiếng Việt.')
    ],
    words: [
      w('from', '/frʌm/', 'từ, đến từ', 'He is from Korea.', 'Anh ấy đến từ Hàn Quốc.'),
      w('live', '/lɪv/', 'sống, ở', 'We live in a small city.', 'Chúng tôi sống ở một thành phố nhỏ.'),
      w('speak', '/spiːk/', 'nói (một ngôn ngữ)', 'I speak slowly.', 'Tôi nói chậm.'),
      w('English', '/ˈɪŋɡlɪʃ/', 'tiếng Anh', 'I study English every day.', 'Tôi học tiếng Anh mỗi ngày.'),
      w('little', '/ˈlɪtl/', 'một chút, nhỏ', 'I have a little time.', 'Tôi có một chút thời gian.'),
      w('where', '/wer/', 'ở đâu', 'Where is my bag?', 'Túi của tôi ở đâu?')
    ] },
  { id: 'l1-personal', level: 1, icon: '🪪', en: 'Personal Information', vi: 'Thông tin cá nhân', goal: 'Nói tuổi, số điện thoại và nghề nghiệp.',
    sentences: [
      s('How old are you?', 'Bạn bao nhiêu tuổi?'),
      s('I am twenty years old.', 'Tôi hai mươi tuổi.', ['i am twenty']),
      s('What is your phone number?', 'Số điện thoại của bạn là gì?'),
      s('My phone number is new.', 'Số điện thoại của tôi là số mới.'),
      s('What do you do?', 'Bạn làm nghề gì?'),
      s('I work in an office.', 'Tôi làm việc ở văn phòng.'),
      s('Are you married?', 'Bạn đã kết hôn chưa?'),
      s('No, I am single.', 'Chưa, tôi còn độc thân.')
    ],
    words: [
      w('old', '/oʊld/', 'già, cũ, (bao nhiêu) tuổi', 'My car is old.', 'Xe của tôi cũ.'),
      w('years', '/jɪrz/', 'năm (số nhiều)', 'I am ten years old.', 'Tôi mười tuổi.'),
      w('phone', '/foʊn/', 'điện thoại', 'This is my phone.', 'Đây là điện thoại của tôi.'),
      w('number', '/ˈnʌmbər/', 'số', 'This is my room number.', 'Đây là số phòng của tôi.'),
      w('work', '/wɜːrk/', 'làm việc', 'I work every day.', 'Tôi làm việc mỗi ngày.'),
      w('office', '/ˈɔːfɪs/', 'văn phòng', 'The office is big.', 'Văn phòng rất lớn.')
    ] },
  { id: 'l1-polite', level: 1, icon: '🙏', en: 'Polite Phrases', vi: 'Câu nói lịch sự', goal: 'Xin lỗi, cảm ơn và nhờ người khác nói lại.',
    sentences: [
      s('Thank you very much.', 'Cảm ơn bạn rất nhiều.'),
      s('You are welcome.', 'Không có gì.'),
      s('I am so sorry.', 'Tôi rất xin lỗi.'),
      s('Excuse me, please.', 'Xin lỗi, làm ơn cho tôi hỏi.'),
      s('Please say it again.', 'Làm ơn nói lại lần nữa.'),
      s('Please speak slowly.', 'Làm ơn nói chậm thôi.'),
      s('I do not understand.', 'Tôi không hiểu.', ["i don't understand"]),
      s('Can you help me?', 'Bạn có thể giúp tôi không?')
    ],
    words: [
      w('thank', '/θæŋk/', 'cảm ơn', 'Thank you, teacher.', 'Em cảm ơn thầy cô.'),
      w('welcome', '/ˈwelkəm/', 'chào mừng; không có gì', 'Welcome to my home.', 'Chào mừng đến nhà tôi.'),
      w('sorry', '/ˈsɑːri/', 'xin lỗi', 'Sorry, I am late.', 'Xin lỗi, tôi đến muộn.'),
      w('again', '/əˈɡen/', 'lại, lần nữa', 'See you again.', 'Hẹn gặp lại bạn.'),
      w('understand', '/ˌʌndərˈstænd/', 'hiểu', 'I understand you.', 'Tôi hiểu bạn.'),
      w('help', '/help/', 'giúp đỡ', 'I can help you.', 'Tôi có thể giúp bạn.')
    ] },

  // ---------- LEVEL 2 ----------
  { id: 'l2-family', level: 2, icon: '👨‍👩‍👧', en: 'Family', vi: 'Gia đình', goal: 'Giới thiệu các thành viên trong gia đình.',
    sentences: [
      s('This is my family.', 'Đây là gia đình tôi.'),
      s('I have one brother.', 'Tôi có một anh trai.'),
      s('My mother is a nurse.', 'Mẹ tôi là y tá.'),
      s('My father works in a bank.', 'Bố tôi làm việc ở ngân hàng.'),
      s('Do you have any sisters?', 'Bạn có chị em gái không?'),
      s('My sister is ten years old.', 'Em gái tôi mười tuổi.'),
      s('We live with our grandparents.', 'Chúng tôi sống cùng ông bà.'),
      s('I love my family very much.', 'Tôi rất yêu gia đình mình.')
    ],
    words: [
      w('family', '/ˈfæməli/', 'gia đình', 'My family is small.', 'Gia đình tôi nhỏ.'),
      w('brother', '/ˈbrʌðər/', 'anh trai, em trai', 'My brother is tall.', 'Anh trai tôi cao.'),
      w('mother', '/ˈmʌðər/', 'mẹ', 'I call my mother every day.', 'Tôi gọi cho mẹ mỗi ngày.'),
      w('father', '/ˈfɑːðər/', 'bố, ba', 'My father is at home.', 'Bố tôi đang ở nhà.'),
      w('sister', '/ˈsɪstər/', 'chị gái, em gái', 'She is my sister.', 'Cô ấy là chị gái tôi.'),
      w('grandparents', '/ˈɡrænperənts/', 'ông bà', 'I visit my grandparents.', 'Tôi đi thăm ông bà.')
    ] },
  { id: 'l2-friends', level: 2, icon: '🤝', en: 'Friends', vi: 'Bạn bè', goal: 'Nói về bạn bè và rủ nhau đi chơi.',
    sentences: [
      s('She is my best friend.', 'Cô ấy là bạn thân nhất của tôi.'),
      s('He is very funny.', 'Anh ấy rất hài hước.'),
      s('We study together.', 'Chúng tôi học cùng nhau.'),
      s('My friends are very kind.', 'Các bạn của tôi rất tốt bụng.'),
      s('Do you want to come?', 'Bạn có muốn đến không?'),
      s('Let us go together.', 'Chúng ta cùng đi nhé.', ["let's go together"]),
      s('I am happy to see you.', 'Tôi rất vui khi gặp bạn.'),
      s('We are good friends.', 'Chúng tôi là bạn tốt.')
    ],
    words: [
      w('best', '/best/', 'tốt nhất', 'This is my best photo.', 'Đây là bức ảnh đẹp nhất của tôi.'),
      w('funny', '/ˈfʌni/', 'hài hước', 'This movie is funny.', 'Bộ phim này hài hước.'),
      w('together', '/təˈɡeðər/', 'cùng nhau', 'We eat together.', 'Chúng tôi ăn cùng nhau.'),
      w('kind', '/kaɪnd/', 'tốt bụng', 'My teacher is kind.', 'Giáo viên của tôi tốt bụng.'),
      w('want', '/wɑːnt/', 'muốn', 'I want some water.', 'Tôi muốn một ít nước.'),
      w('happy', '/ˈhæpi/', 'vui vẻ, hạnh phúc', 'She is very happy.', 'Cô ấy rất vui.')
    ] },
  { id: 'l2-home', level: 2, icon: '🏠', en: 'My Home', vi: 'Nhà của tôi', goal: 'Mô tả ngôi nhà và các phòng.',
    sentences: [
      s('I live in a small house.', 'Tôi sống trong một ngôi nhà nhỏ.'),
      s('My house has three rooms.', 'Nhà tôi có ba phòng.'),
      s('This is the kitchen.', 'Đây là nhà bếp.'),
      s('My room is very clean.', 'Phòng của tôi rất sạch.'),
      s('The bathroom is upstairs.', 'Phòng tắm ở trên lầu.'),
      s('There is a big garden.', 'Có một khu vườn lớn.'),
      s('Please come in and sit down.', 'Mời bạn vào và ngồi xuống.'),
      s('I love my home.', 'Tôi yêu ngôi nhà của mình.')
    ],
    words: [
      w('house', '/haʊs/', 'ngôi nhà', 'Their house is new.', 'Nhà của họ mới.'),
      w('room', '/ruːm/', 'căn phòng', 'This room is big.', 'Căn phòng này lớn.'),
      w('kitchen', '/ˈkɪtʃɪn/', 'nhà bếp', 'My mother is in the kitchen.', 'Mẹ tôi đang ở trong bếp.'),
      w('clean', '/kliːn/', 'sạch', 'The table is clean.', 'Cái bàn sạch.'),
      w('bathroom', '/ˈbæθruːm/', 'phòng tắm', 'Where is the bathroom?', 'Phòng tắm ở đâu?'),
      w('garden', '/ˈɡɑːrdn/', 'khu vườn', 'The garden is beautiful.', 'Khu vườn rất đẹp.')
    ] },
  { id: 'l2-objects', level: 2, icon: '🎒', en: 'Everyday Objects', vi: 'Đồ vật hằng ngày', goal: 'Gọi tên đồ vật và hỏi đồ vật ở đâu.',
    sentences: [
      s('What is this?', 'Đây là cái gì?'),
      s('This is my new phone.', 'Đây là điện thoại mới của tôi.'),
      s('Where are my keys?', 'Chìa khóa của tôi đâu rồi?'),
      s('Your bag is on the table.', 'Túi của bạn ở trên bàn.'),
      s('The book is under the chair.', 'Quyển sách ở dưới ghế.'),
      s('Is this your pen?', 'Đây có phải là bút của bạn không?'),
      s('I need a new computer.', 'Tôi cần một máy tính mới.'),
      s('Can I use your pen?', 'Tôi dùng bút của bạn được không?')
    ],
    words: [
      w('keys', '/kiːz/', 'chìa khóa (số nhiều)', 'I have two keys.', 'Tôi có hai chìa khóa.'),
      w('bag', '/bæɡ/', 'cái túi', 'My bag is heavy.', 'Túi của tôi nặng.'),
      w('table', '/ˈteɪbl/', 'cái bàn', 'The table is small.', 'Cái bàn nhỏ.'),
      w('book', '/bʊk/', 'quyển sách', 'I read a book.', 'Tôi đọc một quyển sách.'),
      w('chair', '/tʃer/', 'cái ghế', 'Please sit on this chair.', 'Mời bạn ngồi ghế này.'),
      w('pen', '/pen/', 'cái bút', 'I need a pen.', 'Tôi cần một cái bút.')
    ] },
  { id: 'l2-describe', level: 2, icon: '🎨', en: 'Colors & Describing', vi: 'Màu sắc và miêu tả', goal: 'Dùng tính từ đơn giản để miêu tả người và vật.',
    sentences: [
      s('My car is red.', 'Xe của tôi màu đỏ.'),
      s('What color is your bag?', 'Túi của bạn màu gì?'),
      s('The sky is very blue.', 'Bầu trời rất xanh.'),
      s('This room is too small.', 'Căn phòng này quá nhỏ.'),
      s('My brother is very tall.', 'Anh trai tôi rất cao.'),
      s('She has long black hair.', 'Cô ấy có mái tóc đen dài.'),
      s('This dog is so cute.', 'Con chó này dễ thương quá.'),
      s('You look very nice today.', 'Hôm nay trông bạn rất đẹp.')
    ],
    words: [
      w('color', '/ˈkʌlər/', 'màu sắc', 'I like this color.', 'Tôi thích màu này.'),
      w('blue', '/bluː/', 'màu xanh dương', 'My bag is blue.', 'Túi của tôi màu xanh dương.'),
      w('small', '/smɔːl/', 'nhỏ', 'This is a small town.', 'Đây là một thị trấn nhỏ.'),
      w('tall', '/tɔːl/', 'cao', 'That man is tall.', 'Người đàn ông đó cao.'),
      w('hair', '/her/', 'tóc', 'Her hair is short.', 'Tóc cô ấy ngắn.'),
      w('cute', '/kjuːt/', 'dễ thương', 'The baby is cute.', 'Em bé dễ thương.')
    ] },

  // ---------- LEVEL 3 ----------
  { id: 'l3-food', level: 3, icon: '🍜', en: 'Food', vi: 'Đồ ăn', goal: 'Nói bạn thích ăn gì và muốn ăn gì.',
    sentences: [
      s('I am very hungry.', 'Tôi đói quá.'),
      s('What do you want to eat?', 'Bạn muốn ăn gì?'),
      s('I would like some rice.', 'Tôi muốn một ít cơm.'),
      s('Do you like chicken?', 'Bạn có thích thịt gà không?'),
      s('I do not eat meat.', 'Tôi không ăn thịt.', ["i don't eat meat"]),
      s('This soup is very good.', 'Món súp này rất ngon.'),
      s('The fish is too salty.', 'Món cá này mặn quá.'),
      s('I love Vietnamese food.', 'Tôi rất thích món ăn Việt Nam.')
    ],
    words: [
      w('hungry', '/ˈhʌŋɡri/', 'đói', 'The baby is hungry.', 'Em bé đang đói.'),
      w('eat', '/iːt/', 'ăn', 'We eat at seven.', 'Chúng tôi ăn lúc bảy giờ.'),
      w('rice', '/raɪs/', 'cơm, gạo', 'I eat rice for lunch.', 'Tôi ăn cơm vào bữa trưa.'),
      w('chicken', '/ˈtʃɪkɪn/', 'thịt gà, con gà', 'This chicken is good.', 'Món gà này ngon.'),
      w('soup', '/suːp/', 'súp, canh', 'I like hot soup.', 'Tôi thích súp nóng.'),
      w('fish', '/fɪʃ/', 'cá', 'We have fish today.', 'Hôm nay chúng tôi có cá.')
    ] },
  { id: 'l3-cafe', level: 3, icon: '☕', en: 'At a Cafe', vi: 'Ở quán cà phê', goal: 'Gọi đồ uống và thanh toán.',
    sentences: [
      s('Can I have a coffee, please?', 'Cho tôi một ly cà phê nhé?', ['can i have coffee please']),
      s('I would like some tea.', 'Tôi muốn một ít trà.'),
      s('A glass of water, please.', 'Cho tôi một ly nước.'),
      s('No sugar, please.', 'Làm ơn đừng cho đường.'),
      s('Is this seat free?', 'Chỗ này còn trống không?'),
      s('The coffee is too hot.', 'Cà phê nóng quá.'),
      s('The bill, please.', 'Cho tôi xin hóa đơn.'),
      s('I drink water every day.', 'Tôi uống nước mỗi ngày.')
    ],
    words: [
      w('coffee', '/ˈkɔːfi/', 'cà phê', 'This coffee is hot.', 'Ly cà phê này nóng.'),
      w('tea', '/tiː/', 'trà', 'I drink tea at home.', 'Tôi uống trà ở nhà.'),
      w('water', '/ˈwɔːtər/', 'nước', 'Can I have some water?', 'Cho tôi xin ít nước được không?'),
      w('sugar', '/ˈʃʊɡər/', 'đường', 'I do not want sugar.', 'Tôi không muốn đường.'),
      w('seat', '/siːt/', 'chỗ ngồi', 'This is my seat.', 'Đây là chỗ ngồi của tôi.'),
      w('bill', '/bɪl/', 'hóa đơn', 'Here is the bill.', 'Đây là hóa đơn.')
    ] },
  { id: 'l3-shopping', level: 3, icon: '🛍️', en: 'Shopping', vi: 'Mua sắm', goal: 'Hỏi mua và thử quần áo.',
    sentences: [
      s('I am looking for a shirt.', 'Tôi đang tìm một chiếc áo sơ mi.'),
      s('Do you have a smaller size?', 'Bạn có cỡ nhỏ hơn không?'),
      s('Can I try it on?', 'Tôi mặc thử được không?'),
      s('I like this blue dress.', 'Tôi thích chiếc váy xanh này.'),
      s('It is too big for me.', 'Nó quá rộng với tôi.'),
      s('I will take this one.', 'Tôi sẽ lấy cái này.'),
      s('Can I pay by card?', 'Tôi trả bằng thẻ được không?'),
      s('Here is your change.', 'Đây là tiền thừa của bạn.')
    ],
    words: [
      w('shirt', '/ʃɜːrt/', 'áo sơ mi', 'This shirt is white.', 'Chiếc áo sơ mi này màu trắng.'),
      w('size', '/saɪz/', 'cỡ, kích thước', 'What size do you need?', 'Bạn cần cỡ nào?'),
      w('try', '/traɪ/', 'thử', 'Please try this cake.', 'Bạn hãy thử bánh này nhé.'),
      w('dress', '/dres/', 'váy đầm', 'She has a red dress.', 'Cô ấy có một chiếc váy đỏ.'),
      w('pay', '/peɪ/', 'trả tiền', 'I pay for lunch.', 'Tôi trả tiền bữa trưa.'),
      w('card', '/kɑːrd/', 'thẻ', 'This is my bank card.', 'Đây là thẻ ngân hàng của tôi.')
    ] },
  { id: 'l3-prices', level: 3, icon: '💵', en: 'Prices', vi: 'Giá cả', goal: 'Hỏi giá và trả giá lịch sự.',
    sentences: [
      s('How much is this shirt?', 'Cái áo sơ mi này bao nhiêu tiền?'),
      s('How much are these shoes?', 'Đôi giày này bao nhiêu tiền?'),
      s('It is ten dollars.', 'Nó giá mười đô la.'),
      s('It is too expensive.', 'Nó đắt quá.'),
      s('Can you make it cheaper?', 'Bạn có thể bớt giá không?'),
      s('That is a good price.', 'Đó là giá tốt.'),
      s('I do not have much money.', 'Tôi không có nhiều tiền.', ["i don't have much money"]),
      s('This one is cheap.', 'Cái này rẻ.')
    ],
    words: [
      w('much', '/mʌtʃ/', 'nhiều; (how much) bao nhiêu', 'How much is it?', 'Cái này bao nhiêu tiền?'),
      w('shoes', '/ʃuːz/', 'đôi giày', 'My shoes are new.', 'Đôi giày của tôi mới.'),
      w('expensive', '/ɪkˈspensɪv/', 'đắt', 'That bag is expensive.', 'Cái túi đó đắt.'),
      w('cheap', '/tʃiːp/', 'rẻ', 'This pen is cheap.', 'Cái bút này rẻ.'),
      w('price', '/praɪs/', 'giá', 'What is the price?', 'Giá bao nhiêu?'),
      w('money', '/ˈmʌni/', 'tiền', 'I need some money.', 'Tôi cần một ít tiền.')
    ] },
  { id: 'l3-numbers', level: 3, icon: '🔢', en: 'Numbers', vi: 'Số đếm', goal: 'Dùng số đếm để nói số lượng.',
    sentences: [
      s('I have two children.', 'Tôi có hai đứa con.'),
      s('There are five people here.', 'Có năm người ở đây.'),
      s('I want three apples.', 'Tôi muốn ba quả táo.'),
      s('One coffee and two teas, please.', 'Cho một cà phê và hai trà.'),
      s('How many people are there?', 'Có bao nhiêu người vậy?'),
      s('My room number is twelve.', 'Số phòng của tôi là mười hai.'),
      s('We need four tickets.', 'Chúng tôi cần bốn vé.'),
      s('I am thirty years old.', 'Tôi ba mươi tuổi.')
    ],
    words: [
      w('two', '/tuː/', 'số hai', 'I have two cats.', 'Tôi có hai con mèo.'),
      w('five', '/faɪv/', 'số năm', 'I wake up at five.', 'Tôi thức dậy lúc năm giờ.'),
      w('three', '/θriː/', 'số ba', 'We have three days.', 'Chúng tôi có ba ngày.'),
      w('many', '/ˈmeni/', '(how many) bao nhiêu; nhiều', 'I have many books.', 'Tôi có nhiều sách.'),
      w('twelve', '/twelv/', 'số mười hai', 'She is twelve.', 'Cô bé mười hai tuổi.'),
      w('tickets', '/ˈtɪkɪts/', 'vé (số nhiều)', 'I have the tickets.', 'Tôi có vé rồi.')
    ] }
];
