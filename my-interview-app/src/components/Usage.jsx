import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './Usage.css';

const slides = [
  { 
    title: 'かんたんに始められます', 
    img : "/src/assets/hero.png", 
    img_alt: "Hero Image", 
    description: "スライダーを動かすだけで、明るさや色彩を自由に調整できます。" 
  },
  { 
    title: '過去の経験を整理', 
    img : "/src/assets/hero.png", 
    img_alt: "Self Analysis", 
    description: "ステップに沿って質問に答えるだけで、あなたの強みが整理されます。" 
  },
  { 
    title: 'AIと実戦練習', 
    img : "/src/assets/hero.png", 
    img_alt: "Interview Training", 
    description: "本番さながらの環境で練習でき、AIがリアルタイムでフィードバックします。" 
  }
];

const Usage = ({ isOpen, setIsOpen }) => {
  const swiperRef = useRef(null);

  return (
    <>
      <article className={isOpen ? "usage_pop_up isOpen" : "usage_pop_up"}>
        <Swiper
          modules={[Pagination, Navigation]}
          slidesPerView={1}
          spaceBetween={30}
          pagination={{ 
            clickable: true,
            el: '.swiper-pagination'
          }}
          navigation={{
            nextEl: '.next-btn',
            prevEl: '.back-btn',
          }}
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper;
          }}
          className="usage-swiper"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <div className="slide-content">
                <h2 className="slide-title">{slide.title}</h2>
                <img src={slide.img} alt={slide.img_alt} className="slide-image" />
                <p className="slide-description">
                  {slide.description}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="usage-footer">
          <button className="nav-button back-btn">戻る</button>
          <div className="swiper-pagination"></div>
          <button className="nav-button next-btn">次へ</button>
        </div>
      </article>
      <div 
        className={isOpen ? "usage_pop_mask isOpen" : "usage_pop_mask"} 
        onClick={() => setIsOpen(false)}
      ></div>
    </>
  );
}

export default Usage;
