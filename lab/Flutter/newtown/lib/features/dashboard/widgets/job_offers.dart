
import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_helper.dart';
import 'package:jobs_in_education/utils/assets_path.dart';
import 'package:jobs_in_education/utils/colors.dart';
import 'package:jobs_in_education/utils/screen_size.dart';

class JobOffers extends StatelessWidget {
  JobOffers({required this.helper, Key? key}) : super(key: key);
  final DashboardHelper helper;
  final _currentSlide = ValueNotifier(0);
  final _screenSize = ScreenSize.instance;
  final _textStyle = (context) => Theme.of(context).textTheme.bodyMedium!;
  final verticalGap = ([double? gap]) => SizedBox(height: gap ?? 5);
  final horzGap = ([double? gap]) => SizedBox(width: gap ?? 5);

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
            constraints: BoxConstraints(maxHeight: double.infinity),
            decoration: BoxDecoration(
              color: lightBlue,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Theme.of(context).primaryColor),
            ),
            padding: EdgeInsets.only(left: 12, right: 12, top: 12, bottom: 0),
            child: CarouselSlider(
                options: CarouselOptions(
                    height: 170, // MediaQuery.of(context).size.height * 0.25,
                    viewportFraction: 1.0,
                    autoPlay: true,
                    enableInfiniteScroll: false,
                    onPageChanged: (index, _) {
                      _currentSlide.value = index;
                    }),
                items: _jobOffersItems(context))),
        verticalGap(),
        ValueListenableBuilder<int>(
            valueListenable: _currentSlide,
            builder: (context, currentSlideIndex, __) {
              return Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(helper.jobOffers.length, (i) => i)
                    .map((dotIndex) {
                  return Container(
                    width: _screenSize.width(2),
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
    // );
  }

  _jobOffersItems(BuildContext context) {
    return helper.jobOffers.map((JobOffer offer) {
      return Column(
        children: [
          // Job Offer
          Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Text(
                  'You Have Got A Job Offer',
                  style: _textStyle(context).copyWith(
                      fontSize: 16,
                      color: Colors.black,
                      fontWeight: FontWeight.bold),
                ),
                // horzGap(10),
                InkWell(
                    onTap: () {
                      // print('Ink well');
                    },
                    child: Container(
                      // button
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.all(Radius.circular(6)),
                        ),
                        padding: EdgeInsets.only(
                            left: 10, right: 5, top: 5, bottom: 5),
                        child: Row(
                          children: [
                            Text(
                              'View Now',
                              style: _textStyle(context).copyWith(
                                  fontSize: 13, color: Colors.indigo.shade500),
                            ),
                            horzGap(),
                            Icon(
                              Icons.east_outlined,
                              color: Colors.indigo.shade500,
                              size: 13,
                            )
                          ],
                        )))
              ]),
          verticalGap(8),
          //School
          Row(
            children: [
              Icon(Icons.school, size: 12, color: Colors.orange),
              horzGap(8),
              Text(
                '${offer.school}',
                style: _textStyle(context).copyWith(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.black),
              ),
              horzGap(8),
              Text(
                '${offer.address}',
                style: _textStyle(context)
                    .copyWith(fontSize: 11, color: Colors.indigo.shade500),
              )
            ],
          ),
          verticalGap(8),
          // Teacher
          Row(
            children: [
              Text(
                '${offer.roleFor}',
                style: _textStyle(context).copyWith(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: Colors.black),
              )
            ],
          ),
          verticalGap(8),

          Row(
            children: [
              Expanded(
                flex: 7,
                child: Column(
                  children: [
                    Row(
                      children: [
                        Text(
                          '${offer.classes}',
                          style: _textStyle(context).copyWith(
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                              color: Colors.black),
                        )
                      ],
                    ),
                    verticalGap(8),
                    Row(
                      children: [
                        Image.asset(AssetsPath.calendarIcon,
                            height: 16, width: 16),
                        horzGap(),
                        Text(
                          'Date of Joining',
                          style: _textStyle(context).copyWith(
                              fontSize: 11, color: Colors.indigo.shade500),
                        ),
                      ],
                    ),
                    verticalGap(2),
                    Row(
                      children: [
                        Text(
                          '${offer.dateOfJoining}',
                          style: _textStyle(context).copyWith(
                              fontSize: 12,
                              // fontWeight: FontWeight.bold,
                              color: Colors.black),
                        ),
                        horzGap(35),
                        Text('₹ ${offer.offer}',
                            style: _textStyle(context).copyWith(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                color: Colors.black)),
                      ],
                    )
                  ],
                ),
              ),

              Expanded(
                  flex: 4,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Image.asset(
                        AssetsPath.jobOfferImage1,
                        height: 80,
                        width: 130,
                      ),
                    ],
                  ))
              // image
            ],
          )
        ],
      );
    }).toList();
  }
}