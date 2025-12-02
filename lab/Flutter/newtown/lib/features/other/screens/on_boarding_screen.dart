import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/material.dart';

import '/routes/route_names.dart';
import '/utils/assets_path.dart';
import '/utils/screen_size.dart';
import '../widgets/jin_logo_with_text.dart';

class OnBoardingScreen extends StatelessWidget {
  OnBoardingScreen({Key? key}) : super(key: key);

  final screenSize = ScreenSize.instance;

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: EdgeInsets.symmetric(
            vertical: screenSize.height(4),
            horizontal: screenSize.width(4),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              JINLogoWithText(
                width: screenSize.width(50),
                height: screenSize.height(7),
              ),
              Expanded(
                child: _OnBoardingCarousel(),
              ),
              SizedBox(height: screenSize.height(2)),
              ElevatedButton(
                onPressed: () => _navigateToLoginScreen(context),
                child: Text('Login'),
                style: ElevatedButton.styleFrom(
                  fixedSize: Size(double.maxFinite, screenSize.height(7)),
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('New to Jobs in Education ?'),
                  TextButton(
                      onPressed: () => _navigateToSignUpScreen(context),
                      child: Text('Register')),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }

  void _navigateToSignUpScreen(BuildContext context) {
    Navigator.pushNamed(context, RouteNames.authSignup);
  }

  void _navigateToLoginScreen(BuildContext context) {
    Navigator.pushNamed(context, RouteNames.authLogin);
  }
}

class _OnBoardingCarousel extends StatelessWidget {
  _OnBoardingCarousel({Key? key}) : super(key: key);

  final carouselItems = [
    _CarouselItem(
      imageAssetPath: AssetsPath.onBoardingCarouselImg1,
      title: 'Take the first step towards finding your dream job!',
      subTitle:
          'Looking for the perfect job? Connecting job seekers and employers in education',
    ),
    _CarouselItem(
      imageAssetPath: AssetsPath.onBoardingCarouselImg2,
      title: 'Take the first step towards finding your dream job!',
      subTitle:
          'Looking for the perfect job? Connecting job seekers and employers in education',
    ),
    _CarouselItem(
      imageAssetPath: AssetsPath.onBoardingCarouselImg3,
      title: 'Take the first step towards finding your dream job!',
      subTitle:
          'Looking for the perfect job? Connecting job seekers and employers in education',
    ),
  ];

  final _screenSize = ScreenSize.instance;
  final _currentSlide = ValueNotifier(0);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        CarouselSlider(
            items: _buildItems(context),
            options: CarouselOptions(
                height: _screenSize.height(61),
                autoPlay: true,
                viewportFraction: 1.0,
                enableInfiniteScroll: false,
                pauseAutoPlayInFiniteScroll: true,
                onPageChanged: (index, _) {
                  _currentSlide.value = index;
                })),
        SizedBox(height: _screenSize.height(2)),
        ValueListenableBuilder<int>(
            valueListenable: _currentSlide,
            builder: (context, currentSlideIndex, __) {
              return Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(carouselItems.length, (i) => i)
                    .map((dotIndex) {
                  return Container(
                    width: _screenSize.width(3),
                    height: _screenSize.height(2),
                    margin: EdgeInsets.symmetric(
                        vertical: _screenSize.height(1),
                        horizontal: _screenSize.width(1)),
                    decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Theme.of(context).primaryColor.withOpacity(
                            currentSlideIndex == dotIndex ? 0.9 : 0.4)),
                  );
                }).toList(),
              );
            }),
      ],
    );
  }

  List<Widget> _buildItems(BuildContext context) => carouselItems
      .map((cItem) => Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              Image.asset(
                cItem.imageAssetPath,
                height: _screenSize.height(44),
                width: _screenSize.width(80),
                fit: BoxFit.contain,
              ),
              SizedBox(height: _screenSize.height(2)),
              Text(
                cItem.title,
                style: Theme.of(context).textTheme.titleLarge,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: _screenSize.height(2)),
              Text(
                cItem.subTitle,
                style: Theme.of(context).textTheme.titleMedium,
                textAlign: TextAlign.center,
              ),
            ],
          ))
      .toList();
}

class _CarouselItem {
  final String imageAssetPath;
  final String title;
  final String subTitle;

  _CarouselItem({
    required this.imageAssetPath,
    required this.title,
    this.subTitle = '',
  });
}
