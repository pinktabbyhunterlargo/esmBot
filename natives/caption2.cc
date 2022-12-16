#include "common.h"

#include <map>
#include <string>
#include <vips/vips8>

using namespace std;
using namespace vips;

char *CaptionTwo(string type, char *BufferData, size_t BufferLength,
                 ArgumentMap Arguments, size_t *DataSize) {

  bool top = GetArgument<bool>(Arguments, "top");
  string caption = GetArgument<string>(Arguments, "caption");
  string font = GetArgument<string>(Arguments, "font");
  string basePath = GetArgument<string>(Arguments, "basePath");

  VOption *options = VImage::option()->set("access", "sequential");

  VImage in =
      VImage::new_from_buffer(BufferData, BufferLength, "",
                              type == "gif" ? options->set("n", -1) : options)
          .colourspace(VIPS_INTERPRETATION_sRGB);

  if (!in.has_alpha())
    in = in.bandjoin(255);

  int width = in.width();
  int size = width / 13;
  int pageHeight = vips_image_get_page_height(in.get_image());
  int nPages = vips_image_get_n_pages(in.get_image());
  int textWidth = width - ((width / 25) * 2);

  string font_string = (font == "roboto" ? "Roboto Condensed" : font) +
                       ", Twemoji Color Emoji " + to_string(size);

  string captionText = "<span background=\"white\">" + caption + "</span>";

  VImage text;
  auto findResult = fontPaths.find(font);
  if (findResult != fontPaths.end()) {
    text = VImage::text(
        ".", VImage::option()->set("fontfile",
                                   (basePath + findResult->second).c_str()));
  }
  text = VImage::text(
      captionText.c_str(),
      VImage::option()
          ->set("rgba", true)
          ->set("font", font_string.c_str())
          ->set("fontfile", (basePath + "assets/fonts/twemoji.otf").c_str())
          ->set("align", VIPS_ALIGN_LOW)
          ->set("width", textWidth));
  VImage captionImage =
      ((text == (vector<double>){0, 0, 0, 0}).bandand())
          .ifthenelse(255, text)
          .embed(width / 25, width / 25, width, text.height() + size,
                 VImage::option()->set("extend", "white"));

  vector<VImage> img;
  for (int i = 0; i < nPages; i++) {
    VImage img_frame =
        type == "gif" ? in.crop(0, i * pageHeight, width, pageHeight) : in;
    VImage frame =
        (top ? captionImage : img_frame)
            .join(top ? img_frame : captionImage, VIPS_DIRECTION_VERTICAL,
                  VImage::option()
                      ->set("background", 0xffffff)
                      ->set("expand", true));
    img.push_back(frame);
  }
  VImage final = VImage::arrayjoin(img, VImage::option()->set("across", 1));
  final.set(VIPS_META_PAGE_HEIGHT, pageHeight + captionImage.height());

  void *buf;
  final.write_to_buffer(
      ("." + type).c_str(), &buf, DataSize,
      type == "gif" ? VImage::option()->set("dither", 0)->set("reoptimise", 1)
                    : 0);

  vips_error_clear();
  vips_thread_shutdown();

  return (char *)buf;
}
