// HỘI THOẠI ĐÓNG VAI. Mỗi chủ đề một hội thoại; a = app nói, u = người học nói.
const a = (en, vi) => ({ speaker: 'app', en, vi, accepts: [] });
const u = (en, vi, accepts = []) => ({ speaker: 'user', en, vi, accepts });

export const DIALOGUES = [
  { topic: 'l1-greetings', title: 'Gặp hàng xóm buổi sáng', scene: 'Bạn gặp hàng xóm trước cửa nhà.', lines: [
    a('Good morning!', 'Chào buổi sáng!'), u('Good morning. How are you today?', 'Chào buổi sáng. Hôm nay bạn thế nào?'),
    a('I am fine, thank you. And you?', 'Tôi khỏe, cảm ơn. Còn bạn?'), u('I am fine too.', 'Tôi cũng khỏe.'),
    a('See you tomorrow.', 'Hẹn gặp bạn ngày mai.'), u('Goodbye and take care.', 'Tạm biệt và bảo trọng nhé.', ['bye and take care'])] },
  { topic: 'l1-introduce', title: 'Làm quen bạn mới', scene: 'Bạn gặp một người mới ở lớp học.', lines: [
    a('Hello, what is your name?', 'Xin chào, bạn tên là gì?'), u('My name is Anna.', 'Tôi tên là Anna.', ['my name is ana', 'my name is hannah', 'my name is anne']),
    a('Nice to meet you, Anna. I am Tom.', 'Rất vui được gặp bạn, Anna. Tôi là Tom.'), u('Nice to meet you too.', 'Tôi cũng rất vui được gặp bạn.'),
    a('Are you a teacher?', 'Bạn có phải giáo viên không?'), u('No, I am a student.', 'Không, tôi là sinh viên.')] },
  { topic: 'l1-country', title: 'Trò chuyện với khách nước ngoài', scene: 'Một du khách hỏi chuyện bạn.', lines: [
    a('Where are you from?', 'Bạn đến từ đâu?'), u('I am from Vietnam.', 'Tôi đến từ Việt Nam.'),
    a('Where do you live?', 'Bạn sống ở đâu?'), u('I live in Hanoi.', 'Tôi sống ở Hà Nội.'),
    a('Do you speak English?', 'Bạn có nói tiếng Anh không?'), u('I speak a little English.', 'Tôi nói được một chút tiếng Anh.')] },
  { topic: 'l1-personal', title: 'Điền thông tin', scene: 'Nhân viên hỏi thông tin của bạn.', lines: [
    a('How old are you?', 'Bạn bao nhiêu tuổi?'), u('I am twenty years old.', 'Tôi hai mươi tuổi.', ['i am twenty']),
    a('What do you do?', 'Bạn làm nghề gì?'), u('I work in an office.', 'Tôi làm việc ở văn phòng.'),
    a('Are you married?', 'Bạn đã kết hôn chưa?'), u('No, I am single.', 'Chưa, tôi còn độc thân.')] },
  { topic: 'l1-polite', title: 'Hỏi lại khi chưa hiểu', scene: 'Bạn nghe không rõ người nước ngoài nói gì.', lines: [
    a('The station is on the left.', 'Nhà ga ở bên trái.'), u('Excuse me, please say it again.', 'Xin lỗi, làm ơn nói lại lần nữa.'),
    a('The station is on the left.', 'Nhà ga ở bên trái.'), u('Please speak slowly.', 'Làm ơn nói chậm thôi.'),
    a('On the left. Do you understand?', 'Bên trái. Bạn hiểu không?'), u('Yes. Thank you very much.', 'Vâng. Cảm ơn bạn rất nhiều.')] },
  { topic: 'l2-family', title: 'Kể về gia đình', scene: 'Bạn mới hỏi về gia đình của bạn.', lines: [
    a('Do you have any sisters?', 'Bạn có chị em gái không?'), u('No, I have one brother.', 'Không, tôi có một anh trai.'),
    a('What does your mother do?', 'Mẹ bạn làm nghề gì?'), u('My mother is a nurse.', 'Mẹ tôi là y tá.'),
    a('Do you live with your parents?', 'Bạn sống với bố mẹ không?'), u('We live with our grandparents.', 'Chúng tôi sống cùng ông bà.')] },
  { topic: 'l2-friends', title: 'Rủ bạn đi chơi', scene: 'Bạn của bạn rủ đi chơi cuối tuần.', lines: [
    a('Do you want to come?', 'Bạn có muốn đến không?'), u('Yes, I want to come.', 'Có, tôi muốn đến.'),
    a('My friend Lan is coming too.', 'Bạn tôi là Lan cũng đến.'), u('She is very funny.', 'Cô ấy rất hài hước.'),
    a('Great! See you there.', 'Tuyệt! Hẹn gặp ở đó nhé.'), u('Let us go together.', 'Chúng ta cùng đi nhé.', ["let's go together"])] },
  { topic: 'l2-home', title: 'Mời khách vào nhà', scene: 'Một người bạn đến thăm nhà bạn.', lines: [
    a('Hello! Is this your house?', 'Xin chào! Đây là nhà bạn à?'), u('Yes. Please come in and sit down.', 'Vâng. Mời bạn vào và ngồi xuống.'),
    a('Thank you. Where is the bathroom?', 'Cảm ơn. Phòng tắm ở đâu vậy?'), u('The bathroom is upstairs.', 'Phòng tắm ở trên lầu.'),
    a('Your house is very nice.', 'Nhà bạn đẹp quá.'), u('Thank you. I love my home.', 'Cảm ơn. Tôi yêu ngôi nhà của mình.')] },
  { topic: 'l2-objects', title: 'Tìm đồ bị mất', scene: 'Bạn không tìm thấy chìa khóa.', lines: [
    a('What is wrong?', 'Có chuyện gì vậy?'), u('Where are my keys?', 'Chìa khóa của tôi đâu rồi?'),
    a('Are they in your bag?', 'Có trong túi bạn không?'), u('No. My bag is on the table.', 'Không. Túi của tôi ở trên bàn.'),
    a('Look! They are under the chair.', 'Nhìn kìa! Chúng ở dưới ghế.'), u('Thank you very much.', 'Cảm ơn bạn rất nhiều.')] },
  { topic: 'l2-describe', title: 'Khen một người bạn', scene: 'Bạn gặp một người bạn lâu ngày.', lines: [
    a('Hi! Long time no see.', 'Chào! Lâu quá không gặp.'), u('You look very nice today.', 'Hôm nay trông bạn rất đẹp.'),
    a('Thank you! Do you like my bag?', 'Cảm ơn! Bạn có thích túi của tôi không?'), u('Yes. What color is your bag?', 'Có. Túi của bạn màu gì?'),
    a('It is blue. And this is my dog.', 'Nó màu xanh dương. Còn đây là chó của tôi.'), u('This dog is so cute.', 'Con chó này dễ thương quá.')] },
  { topic: 'l3-food', title: 'Ăn trưa cùng bạn', scene: 'Bạn và đồng nghiệp đi ăn trưa.', lines: [
    a('What do you want to eat?', 'Bạn muốn ăn gì?'), u('I would like some rice.', 'Tôi muốn một ít cơm.'),
    a('Do you like chicken?', 'Bạn có thích thịt gà không?'), u('I do not eat meat.', 'Tôi không ăn thịt.', ["i don't eat meat"]),
    a('How is the soup?', 'Món súp thế nào?'), u('This soup is very good.', 'Món súp này rất ngon.')] },
  { topic: 'l3-cafe', title: 'Gọi đồ ở quán cà phê', scene: 'Bạn đang gọi đồ uống với nhân viên.', lines: [
    a('Hello, what would you like?', 'Xin chào, bạn muốn dùng gì?'), u('Can I have a coffee, please?', 'Cho tôi một ly cà phê nhé?', ['can i have coffee please']),
    a('With sugar?', 'Có đường không?'), u('No sugar, please.', 'Làm ơn đừng cho đường.'),
    a('Anything else?', 'Bạn cần gì nữa không?'), u('A glass of water, please.', 'Cho tôi một ly nước.')] },
  { topic: 'l3-shopping', title: 'Mua áo', scene: 'Bạn đang ở cửa hàng quần áo.', lines: [
    a('Can I help you?', 'Tôi giúp gì được cho bạn?'), u('I am looking for a shirt.', 'Tôi đang tìm một chiếc áo sơ mi.'),
    a('How about this one?', 'Cái này thì sao?'), u('Can I try it on?', 'Tôi mặc thử được không?'),
    a('Of course. Is it good?', 'Tất nhiên. Có vừa không?'), u('Yes. I will take this one.', 'Vâng. Tôi sẽ lấy cái này.')] },
  { topic: 'l3-prices', title: 'Trả giá ở chợ', scene: 'Bạn hỏi giá đôi giày ở chợ.', lines: [
    a('Hello. Do you like these shoes?', 'Xin chào. Bạn thích đôi giày này không?'), u('How much are these shoes?', 'Đôi giày này bao nhiêu tiền?'),
    a('They are thirty dollars.', 'Chúng giá ba mươi đô la.'), u('It is too expensive.', 'Nó đắt quá.'),
    a('How about twenty dollars?', 'Hai mươi đô la thì sao?'), u('That is a good price.', 'Đó là giá tốt.')] },
  { topic: 'l3-numbers', title: 'Mua vé xem phim', scene: 'Bạn mua vé cho cả nhóm.', lines: [
    a('Hello. How many people are there?', 'Xin chào. Có bao nhiêu người vậy?'), u('There are five people here.', 'Có năm người ở đây.'),
    a('How many tickets do you need?', 'Bạn cần bao nhiêu vé?'), u('We need four tickets.', 'Chúng tôi cần bốn vé.'),
    a('Do you want some water?', 'Bạn có muốn nước không?'), u('One coffee and two teas, please.', 'Cho một cà phê và hai trà.')] }
];
