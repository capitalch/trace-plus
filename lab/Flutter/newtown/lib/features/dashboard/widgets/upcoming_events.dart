import 'package:carousel_slider/carousel_slider.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:jobs_in_education/features/dashboard/dashboard_helper.dart';
import 'package:jobs_in_education/utils/assets_path.dart';
import 'package:jobs_in_education/utils/colors.dart';
import 'package:jobs_in_education/utils/screen_size.dart';

class UpcomingEvents extends StatelessWidget {
  UpcomingEvents({required this.helper, Key? key}) : super(key: key);
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
          constraints: BoxConstraints(
              maxWidth: double.infinity,
              maxHeight: double.infinity),
          decoration: BoxDecoration(
            color: lightBlue,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: Theme.of(context).primaryColor),
          ),
          padding: EdgeInsets.only(left: 12, top: 12, right: 12),
          child: CarouselSlider(
              options: CarouselOptions(
                  height: 116, //MediaQuery.of(context).size.height * 0.18,
                  //_screenSize.height(25),
                  viewportFraction: 1.0,
                  autoPlay: true,
                  enableInfiniteScroll: false,
                  onPageChanged: (index, _) {
                    _currentSlide.value = index;
                  }),
              items: _upcomingEventItems(context)),
        ),
        verticalGap(),
        ValueListenableBuilder<int>(
            valueListenable: _currentSlide,
            builder: (context, currentSlideIndex, __) {
              return Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(helper.upcomingEvents.length, (i) => i)
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
  }

  _upcomingEventItems(BuildContext context) {
    return helper.upcomingEvents.map((UpcomingEvent event) {
      return Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.start,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Text(
                '${event.eventType}',
                style: _textStyle(context)
                    .copyWith(color: Colors.black, fontWeight: FontWeight.bold),
              ),
              horzGap(),
              ImageIcon(AssetImage(AssetsPath.interviewAlertIcon),
                  size: 14, color: Colors.orange),
            ],
          ),
          verticalGap(3),
          Row(children: [
            Text(
              'Interview has been scheduled',
              style: _textStyle(context)
                  .copyWith(color: Colors.indigo.shade300, fontSize: 12),
            ),
            horzGap(),
            Text(
              '${event.eventTime}',
              style: _textStyle(context).copyWith(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: 12),
            )
          ]),
          // verticalGap(),
          Container(
            child: Row(
              children: [
                Expanded(
                  flex: 4,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(children: [
                        Flexible(
                            child: Text(
                          'for',
                          style: _textStyle(context).copyWith(
                              color: Colors.black,
                              fontSize: 12,
                              fontWeight: FontWeight.bold),
                        )),
                        horzGap(),
                        Expanded(
                            child: Text(
                          '${event.roleFor}',
                          style: _textStyle(context).copyWith(
                              color: Colors.black,
                              fontSize: 12,
                              fontWeight: FontWeight.bold),
                        ))
                      ]),
                      verticalGap(),
                      Row(
                        children: [
                          Icon(Icons.school, size: 12, color: Colors.orange),
                          horzGap(),
                          Flexible(
                              child: Text(
                            '${event.school}',
                            style: _textStyle(context).copyWith(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.black),
                          )),
                          horzGap(),
                          Flexible(
                              child: Text('${event.address}',
                                  style: _textStyle(context).copyWith(
                                      fontSize: 10,
                                      color: Colors.indigo.shade300)))
                        ],
                      ),
                      verticalGap(),
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              '${event.eventRounds.toString()}',
                              style: _textStyle(context).copyWith(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: Colors.black),
                            ),
                          ),
                          // verticalGap(),
                        ],
                      )
                    ],
                  ),
                ),
                Expanded(
                    flex: 2,
                    child: Column(
                      children: [Image.asset(AssetsPath.interviewAlertImage)],
                    ))
              ],
            ),
          ),
        ],
      );
    }).toList();
  }
}
